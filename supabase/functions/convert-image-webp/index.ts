import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversionRequest {
  imageUrl: string;
  sourceTable: string;
  sourceId: string;
  quality?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { imageUrl, sourceTable, sourceId, quality = 85 }: ConversionRequest = await req.json();

    if (!imageUrl || !sourceTable || !sourceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: imageUrl, sourceTable, sourceId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Converting image: ${imageUrl} for ${sourceTable}/${sourceId}`);

    // Check if already WEBP
    const isAlreadyWebp = imageUrl.toLowerCase().includes('.webp');
    if (isAlreadyWebp) {
      console.log('Image is already in WEBP format, skipping conversion');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Image is already in WEBP format',
          skipped: true,
          url: imageUrl 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Download original image
    console.log('Downloading original image...');
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    const originalBlob = await imageResponse.blob();
    const originalSize = originalBlob.size;
    const originalFormat = imageUrl.split('.').pop()?.toUpperCase() || 'UNKNOWN';
    
    console.log(`Original image: ${originalFormat}, ${originalSize} bytes`);

    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const originalFilename = urlParts[urlParts.length - 1];
    const filenameWithoutExt = originalFilename.replace(/\.[^.]+$/, '');
    
    // Create backup path
    const backupPath = `backups/${sourceTable}/${sourceId}/${originalFilename}`;
    
    // Upload backup
    console.log('Creating backup...');
    const { error: backupError } = await supabase.storage
      .from('project-images')
      .upload(backupPath, originalBlob, {
        contentType: originalBlob.type,
        upsert: true
      });

    if (backupError) {
      console.error('Backup upload error:', backupError);
      // Continue anyway - backup is optional
    }

    const { data: backupUrlData } = supabase.storage
      .from('project-images')
      .getPublicUrl(backupPath);
    
    const backupUrl = backupUrlData?.publicUrl || null;

    // For conversion, we'll use canvas approach via the existing client-side conversion
    // Since Deno doesn't have native canvas, we'll store the original and mark for client conversion
    // In a production environment, you'd use a service like Sharp or ImageMagick via Docker
    
    // For now, we'll create a conversion record and let the client handle actual conversion
    const timestamp = Date.now();
    const webpFilename = `${filenameWithoutExt}-${timestamp}.webp`;
    const webpPath = `${sourceTable}/${sourceId}/${webpFilename}`;

    // Record the conversion attempt
    const { data: conversionRecord, error: recordError } = await supabase
      .from('image_conversions')
      .insert({
        source_table: sourceTable,
        source_id: sourceId,
        original_url: imageUrl,
        backup_url: backupUrl,
        original_format: originalFormat,
        original_size: originalSize,
        status: 'pending_client', // Needs client-side conversion
      })
      .select()
      .single();

    if (recordError) {
      console.error('Error creating conversion record:', recordError);
      throw recordError;
    }

    console.log('Conversion record created:', conversionRecord.id);

    return new Response(
      JSON.stringify({
        success: true,
        conversionId: conversionRecord.id,
        message: 'Conversion record created. Client-side conversion required.',
        backupUrl,
        originalFormat,
        originalSize,
        targetPath: webpPath
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Conversion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Conversion failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});