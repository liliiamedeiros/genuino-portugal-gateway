import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { conversions, savings_bytes, errors, notify_completion, notify_error } = await req.json();

    console.log('[Conversion Notification] Received:', { conversions, savings_bytes, errors });

    // Check if we should send notification
    const hasErrors = errors > 0;
    const shouldNotify = (notify_completion && conversions > 0) || (notify_error && hasErrors);

    if (!shouldNotify) {
      console.log('[Conversion Notification] No notification needed based on settings');
      return new Response(
        JSON.stringify({ success: true, message: 'No notification needed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get admin/super_admin push subscriptions
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'super_admin']);

    if (rolesError) {
      console.error('[Conversion Notification] Error fetching admin roles:', rolesError);
      throw rolesError;
    }

    const adminUserIds = adminRoles?.map(r => r.user_id) || [];
    console.log('[Conversion Notification] Admin user IDs:', adminUserIds);

    if (adminUserIds.length === 0) {
      console.log('[Conversion Notification] No admin users found');
      return new Response(
        JSON.stringify({ success: true, message: 'No admin users to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get push subscriptions for admins
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', adminUserIds);

    if (subError) {
      console.error('[Conversion Notification] Error fetching subscriptions:', subError);
      throw subError;
    }

    console.log('[Conversion Notification] Found subscriptions:', subscriptions?.length || 0);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No push subscriptions found for admins' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format notification message
    const savingsMB = (savings_bytes / (1024 * 1024)).toFixed(2);
    
    let title = 'Conversão de Imagens Concluída';
    let body = `${conversions} imagens convertidas, ${savingsMB} MB poupados`;
    
    if (hasErrors) {
      title = 'Conversão com Erros';
      body = `${conversions} convertidas, ${errors} erros, ${savingsMB} MB poupados`;
    }

    // Send push notifications (simplified - in production use web-push library)
    // For now, just log the notification that would be sent
    console.log('[Conversion Notification] Would send notification:', {
      title,
      body,
      subscriptionCount: subscriptions.length
    });

    // Record activity
    await supabase.from('activity_logs').insert({
      action: 'conversion_notification_sent',
      entity_type: 'image_conversion',
      details: {
        conversions,
        savings_bytes,
        errors,
        subscriptions_notified: subscriptions.length
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notification prepared for ${subscriptions.length} subscribers`,
        notification: { title, body }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Conversion Notification] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
