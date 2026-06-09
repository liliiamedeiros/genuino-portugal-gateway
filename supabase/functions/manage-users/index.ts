import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify caller is admin or super_admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user has admin or super_admin role (a user may have multiple roles)
    const { data: rolesData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const roles = (rolesData ?? []).map((r: any) => r.role);
    const callerRole = roles.includes('super_admin')
      ? 'super_admin'
      : roles.includes('admin')
      ? 'admin'
      : null;

    if (!callerRole) {
      throw new Error('Insufficient permissions');
    }

    const { action, email, password, fullName, role, userId, mode, redirectTo } = await req.json();

    console.log('Action:', action, 'User:', email);

    // Privilege escalation guard: admins can only manage editor accounts.
    // Only super_admins can grant/modify admin or super_admin roles.
    const isPrivilegedRole = (r?: string) => r === 'admin' || r === 'super_admin';

    if (callerRole === 'admin') {
      if ((action === 'create' || action === 'update') && role && role !== 'editor') {
        throw new Error('Admins can only assign the editor role');
      }
      if (action === 'update' || action === 'delete' || action === 'reset_password') {
        // Prevent admins from modifying/deleting privileged users (including themselves escalating)
        const { data: targetRole } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        if (targetRole && isPrivilegedRole(targetRole.role)) {
          throw new Error('Admins cannot modify, delete or reset admin or super_admin users');
        }
      }
    }

    // CREATE USER
    if (action === 'create') {
      // Create user with admin client
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: fullName
        }
      });

      if (createError) {
        console.error('Create user error:', createError);
        throw createError;
      }

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: newUser.user.id,
          email: email,
          full_name: fullName
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        // Try to cleanup user
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        throw profileError;
      }

      // Assign role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role: role || 'editor'
        });

      if (roleError) {
        console.error('Role error:', roleError);
        // Cleanup
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        throw roleError;
      }

      return new Response(
        JSON.stringify({ success: true, user: newUser.user }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // UPDATE USER
    if (action === 'update') {
      // Update auth email if changed
      const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { 
          email,
          user_metadata: { full_name: fullName }
        }
      );

      if (updateAuthError) {
        console.error('Update auth error:', updateAuthError);
        throw updateAuthError;
      }

      // Update profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          email,
          full_name: fullName
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Update profile error:', profileError);
        throw profileError;
      }

      // Update role if provided
      if (role) {
        // Delete existing roles
        await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        // Insert new role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userId,
            role
          });

        if (roleError) {
          console.error('Update role error:', roleError);
          throw roleError;
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE USER
    if (action === 'delete') {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error('Delete user error:', deleteError);
        throw deleteError;
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // RESET PASSWORD
    if (action === 'reset_password') {
      const logAttempt = async (status: 'success' | 'error', extra: Record<string, unknown> = {}) => {
        try {
          await supabaseAdmin.from('audit_access_logs').insert({
            user_id: user.id,
            action: 'reset_password',
            table_name: 'auth.users',
            record_id: userId ?? null,
            details: { mode: mode ?? 'email', status, target_email: email ?? null, ...extra },
          });
        } catch (e) {
          console.error('Audit log failed:', e);
        }
      };

      // Mode 'manual': admin sets a new password directly
      if (mode === 'manual') {
        if (!password || typeof password !== 'string' || password.length < 8) {
          await logAttempt('error', { reason: 'invalid_password_length' });
          throw new Error('Password must be at least 8 characters');
        }
        const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
        if (updErr) {
          console.error('Manual reset error:', updErr);
          await logAttempt('error', { reason: updErr.message });
          throw updErr;
        }
        await logAttempt('success');
        return new Response(
          JSON.stringify({ success: true, mode: 'manual' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mode 'email' (default): generate a recovery link / send recovery email
      // Need target email — look it up if not provided
      let targetEmail = email;
      if (!targetEmail) {
        const { data: prof } = await supabaseAdmin
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .maybeSingle();
        targetEmail = prof?.email;
      }
      if (!targetEmail) throw new Error('Target user email not found');

      const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: targetEmail,
        options: redirectTo ? { redirectTo } : undefined,
      });
      if (linkErr) {
        console.error('Recovery link error:', linkErr);
        await logAttempt('error', { reason: linkErr.message, target_email: targetEmail });
        throw linkErr;
      }
      await logAttempt('success', { target_email: targetEmail });

      return new Response(
        JSON.stringify({
          success: true,
          mode: 'email',
          email: targetEmail,
          action_link: linkData?.properties?.action_link ?? null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});