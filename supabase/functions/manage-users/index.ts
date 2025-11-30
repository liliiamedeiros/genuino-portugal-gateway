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

    // Check if user has admin or super_admin role
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'super_admin')) {
      throw new Error('Insufficient permissions');
    }

    const { action, email, password, fullName, role, userId } = await req.json();

    console.log('Action:', action, 'User:', email);

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