import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowlist of trusted domains for image migration source
const ALLOWED_HOSTS = new Set<string>([
  'eyvfrocuuhxleroghybv.supabase.co',
  'images.unsplash.com',
  'unsplash.com',
  'res.cloudinary.com',
  'lovable.dev',
  'lovable.app',
  'lovableproject.com',
]);

function isAllowedUrl(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    if (ALLOWED_HOSTS.has(host)) return true;
    // Allow subdomains of explicitly listed roots
    for (const allowed of ALLOWED_HOSTS) {
      if (host.endsWith('.' + allowed)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function isSafePath(path: string): boolean {
  if (typeof path !== 'string' || path.length === 0 || path.length > 512) return false;
  if (path.startsWith('/') || path.includes('..') || path.includes('\\')) return false;
  // Only allow safe characters: alphanumerics, dash, underscore, dot, slash
  return /^[A-Za-z0-9_\-./]+$/.test(path);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify caller has admin/super_admin/editor role
    const { data: roleRows } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const roles = (roleRows ?? []).map((r: { role: string }) => r.role);
    const allowed = roles.some((r) => r === 'admin' || r === 'super_admin' || r === 'editor');
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { imageUrl, path } = await req.json();

    if (!imageUrl || !path) {
      return new Response(JSON.stringify({ error: 'Missing imageUrl or path' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!isAllowedUrl(imageUrl)) {
      return new Response(JSON.stringify({ error: 'imageUrl host is not allowed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!isSafePath(path)) {
      return new Response(JSON.stringify({ error: 'Invalid storage path' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Downloading image from:', imageUrl);

    const imageResponse = await fetch(imageUrl, { redirect: 'error' });
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }

    const contentType = imageResponse.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'URL did not return an image' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const imageBlob = await imageResponse.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const { error } = await supabaseAdmin.storage
      .from('project-images')
      .upload(path, uint8Array, {
        contentType: imageBlob.type || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('project-images')
      .getPublicUrl(path);

    console.log('Image uploaded successfully:', publicUrl);

    return new Response(JSON.stringify({ publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Migration failed',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
