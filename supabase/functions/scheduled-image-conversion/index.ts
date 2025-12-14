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

    // Update schedule stats
    const stats = {
      last_run: new Date().toISOString(),
      pending_found: pendingCount,
      new_queued: newImagesQueued,
      total_processed: pendingCount + newImagesQueued
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

    console.log(`[Scheduled Conversion] Completed. Pending: ${pendingCount}, New queued: ${newImagesQueued}`);

    return new Response(
      JSON.stringify({
        success: true,
        pending_found: pendingCount,
        new_queued: newImagesQueued,
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
