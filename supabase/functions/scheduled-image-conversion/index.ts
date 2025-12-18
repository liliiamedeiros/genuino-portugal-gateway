import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Authentication check - require service role key OR valid admin JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Scheduled Conversion] Missing Authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized - Missing authorization token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Check if it's the service role key (for cron jobs)
    const isServiceRole = token === supabaseServiceKey;
    
    if (!isServiceRole) {
      // Verify user authentication and admin role
      const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
      
      if (authError || !user) {
        console.error('[Scheduled Conversion] Authentication failed:', authError?.message);
        return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check for admin/super_admin role
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      const { data: userRole, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleError || !userRole) {
        console.error('[Scheduled Conversion] Role check failed:', roleError?.message || 'No role found');
        return new Response(JSON.stringify({ error: 'Forbidden - Insufficient permissions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const allowedRoles = ['admin', 'super_admin'];
      if (!allowedRoles.includes(userRole.role)) {
        console.error('[Scheduled Conversion] User role not authorized:', userRole.role);
        return new Response(JSON.stringify({ error: 'Forbidden - Only admins can trigger scheduled conversions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`[Scheduled Conversion] Authenticated user ${user.id} with role ${userRole.role}`);
    } else {
      console.log('[Scheduled Conversion] Authenticated via service role key (cron job)');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[Scheduled Conversion] Starting scheduled image conversion...');

    // Get active schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('conversion_schedules')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (scheduleError) {
      console.error('[Scheduled Conversion] Error fetching schedule:', scheduleError);
      throw scheduleError;
    }

    if (!schedule) {
      console.log('[Scheduled Conversion] No active schedule found');
      return new Response(
        JSON.stringify({ success: true, message: 'No active schedule', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const maxImages = schedule.max_images_per_run || 50;
    console.log(`[Scheduled Conversion] Max images per run: ${maxImages}`);

    // Get pending conversions
    const { data: pendingConversions, error: pendingError } = await supabase
      .from('image_conversions')
      .select('*')
      .in('status', ['pending', 'pending_client'])
      .limit(maxImages);

    if (pendingError) {
      console.error('[Scheduled Conversion] Error fetching pending conversions:', pendingError);
      throw pendingError;
    }

    const pendingCount = pendingConversions?.length || 0;
    console.log(`[Scheduled Conversion] Found ${pendingCount} pending conversions`);

    // Also find non-WebP images that haven't been queued yet
    const tables = ['projects', 'project_images', 'portfolio_projects', 'portfolio_images'];
    let newImagesQueued = 0;

    for (const table of tables) {
      let query;
      const imageField = table === 'projects' || table === 'portfolio_projects' ? 'main_image' : 'image_url';
      
      if (table === 'projects' || table === 'portfolio_projects') {
        query = supabase
          .from(table)
          .select('id, main_image')
          .not('main_image', 'is', null)
          .not('main_image', 'ilike', '%.webp');
      } else {
        query = supabase
          .from(table)
          .select('id, image_url')
          .not('image_url', 'is', null)
          .not('image_url', 'ilike', '%.webp');
      }

      const { data: images, error: imagesError } = await query;
      
      if (imagesError) {
        console.error(`[Scheduled Conversion] Error fetching from ${table}:`, imagesError);
        continue;
      }

      for (const img of images || []) {
        const imageUrl = img[imageField as keyof typeof img] as string;
        if (!imageUrl) continue;

        // Check if already in queue
        const { data: existing } = await supabase
          .from('image_conversions')
          .select('id')
          .eq('source_table', table)
          .eq('source_id', img.id)
          .maybeSingle();

        if (!existing && newImagesQueued < maxImages - pendingCount) {
          // Extract format from URL
          const format = imageUrl.split('.').pop()?.toUpperCase() || 'UNKNOWN';
          
          // Queue for client-side conversion
          const { error: insertError } = await supabase
            .from('image_conversions')
            .insert({
              source_table: table,
              source_id: img.id,
              original_url: imageUrl,
              original_format: format,
              status: 'pending_client'
            });

          if (!insertError) {
            newImagesQueued++;
            console.log(`[Scheduled Conversion] Queued new image from ${table}/${img.id}`);
          }
        }
      }
    }

    // Calculate conversion stats from completed conversions today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayConversions } = await supabase
      .from('image_conversions')
      .select('original_size, converted_size, savings_percentage')
      .eq('status', 'completed')
      .gte('converted_at', today.toISOString());

    let totalSavingsBytes = 0;
    let avgSavings = 0;
    const conversionCount = todayConversions?.length || 0;

    if (todayConversions && todayConversions.length > 0) {
      totalSavingsBytes = todayConversions.reduce((acc, c) => 
        acc + ((c.original_size || 0) - (c.converted_size || 0)), 0);
      avgSavings = todayConversions.reduce((acc, c) => 
        acc + (c.savings_percentage || 0), 0) / todayConversions.length;
    }

    // Get total image counts
    const { count: webpCount } = await supabase
      .from('image_conversions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const { count: errorCount } = await supabase
      .from('image_conversions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed');

    // Record metrics
    const { error: metricsError } = await supabase
      .from('storage_metrics')
      .insert({
        total_images: pendingCount + newImagesQueued + (webpCount || 0),
        webp_images: webpCount || 0,
        other_images: pendingCount + newImagesQueued,
        conversions_count: conversionCount,
        savings_bytes: totalSavingsBytes,
        average_savings_percentage: avgSavings
      });

    if (metricsError) {
      console.error('[Scheduled Conversion] Error recording metrics:', metricsError);
    }

    // Update schedule stats
    const stats = {
      last_run: new Date().toISOString(),
      pending_found: pendingCount,
      new_queued: newImagesQueued,
      total_processed: pendingCount + newImagesQueued,
      conversions_today: conversionCount,
      savings_today_bytes: totalSavingsBytes
    };

    const { error: updateError } = await supabase
      .from('conversion_schedules')
      .update({
        last_run_at: new Date().toISOString(),
        stats: { ...schedule.stats, ...stats }
      })
      .eq('id', schedule.id);

    if (updateError) {
      console.error('[Scheduled Conversion] Error updating schedule:', updateError);
    }

    // Send notification if configured
    if (schedule.notify_on_completion || (schedule.notify_on_error && (errorCount || 0) > 0)) {
      try {
        const notificationResponse = await fetch(`${supabaseUrl}/functions/v1/send-conversion-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conversions: conversionCount,
            savings_bytes: totalSavingsBytes,
            errors: errorCount || 0,
            notify_completion: schedule.notify_on_completion,
            notify_error: schedule.notify_on_error
          })
        });
        
        const notificationResult = await notificationResponse.json();
        console.log('[Scheduled Conversion] Notification result:', notificationResult);
      } catch (notifyError) {
        console.error('[Scheduled Conversion] Error sending notification:', notifyError);
      }
    }

    console.log(`[Scheduled Conversion] Completed. Pending: ${pendingCount}, New queued: ${newImagesQueued}`);

    return new Response(
      JSON.stringify({
        success: true,
        pending_found: pendingCount,
        new_queued: newImagesQueued,
        conversions_today: conversionCount,
        savings_bytes: totalSavingsBytes,
        message: `Found ${pendingCount} pending, queued ${newImagesQueued} new images`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Scheduled Conversion] Error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
