import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser, Element } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowlists for HTML sanitization
const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a', 'img', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'span', 'div',
  'table', 'tr', 'td', 'th', 'tbody', 'thead', 'tfoot'
]);

const ALLOWED_ATTRS = new Set([
  'href', 'src', 'alt', 'class', 'style', 'target', 'width', 'height', 'title'
]);

// DOM-based HTML sanitizer - more robust than regex
function sanitizeHtml(html: string): string {
  try {
    // Parse the HTML using DOM parser
    const doc = new DOMParser().parseFromString(
      `<div id="root">${html}</div>`,
      'text/html'
    );
    
    if (!doc) {
      console.warn('Failed to parse HTML, returning empty string');
      return '';
    }

    const root = doc.getElementById('root');
    if (!root) {
      return '';
    }

    // Recursively sanitize the DOM tree
    sanitizeNode(root);

    return root.innerHTML;
  } catch (error) {
    console.error('HTML sanitization error:', error);
    // Fallback: strip all HTML tags for safety
    return html.replace(/<[^>]*>/g, '');
  }
}

function sanitizeNode(node: Element): void {
  // Get all child elements (copy to array since we'll modify)
  const children = Array.from(node.children);
  
  for (const child of children) {
    const tagName = child.tagName.toLowerCase();
    
    // Remove disallowed tags entirely
    if (!ALLOWED_TAGS.has(tagName)) {
      // For script/style/iframe - remove completely including content
      if (['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'].includes(tagName)) {
        child.remove();
        continue;
      }
      // For other disallowed tags - unwrap (keep content, remove tag)
      const parent = child.parentElement;
      if (parent) {
        while (child.firstChild) {
          parent.insertBefore(child.firstChild, child);
        }
        child.remove();
      }
      continue;
    }
    
    // Remove disallowed attributes
    const attrs = Array.from(child.attributes);
    for (const attr of attrs) {
      const attrName = attr.name.toLowerCase();
      
      // Remove event handlers (on*)
      if (attrName.startsWith('on')) {
        child.removeAttribute(attr.name);
        continue;
      }
      
      // Check against allowlist
      if (!ALLOWED_ATTRS.has(attrName)) {
        child.removeAttribute(attr.name);
        continue;
      }
      
      // Sanitize href/src to prevent javascript: URLs
      if ((attrName === 'href' || attrName === 'src') && attr.value) {
        const value = attr.value.trim().toLowerCase();
        if (value.startsWith('javascript:') || value.startsWith('data:') || value.startsWith('vbscript:')) {
          child.removeAttribute(attr.name);
        }
      }
      
      // Sanitize style attribute - remove expression() and url() with javascript
      if (attrName === 'style' && attr.value) {
        const cleanStyle = attr.value
          .replace(/expression\s*\([^)]*\)/gi, '')
          .replace(/url\s*\(\s*['"]?\s*javascript:[^)]*\)/gi, '')
          .replace(/behavior\s*:/gi, '');
        child.setAttribute('style', cleanStyle);
      }
    }
    
    // Recursively sanitize children
    if (child.children.length > 0) {
      sanitizeNode(child);
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - require valid JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized - Missing authorization token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Verify user authentication
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user has admin/super_admin role
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleError || !userRole) {
      console.error('Role check failed:', roleError?.message || 'No role found');
      return new Response(JSON.stringify({ error: 'Forbidden - Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const allowedRoles = ['admin', 'super_admin'];
    if (!allowedRoles.includes(userRole.role)) {
      console.error('User role not authorized for newsletter sending:', userRole.role);
      return new Response(JSON.stringify({ error: 'Forbidden - Only admins can send newsletters' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Authenticated user ${user.id} with role ${userRole.role} sending newsletter`);

    const { campaignId } = await req.json();
    
    if (!campaignId || typeof campaignId !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid campaignId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Iniciando envio da campanha:', campaignId);
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Buscar campanha
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('newsletter_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();
    
    if (campaignError) {
      console.error('Erro ao buscar campanha:', campaignError);
      throw campaignError;
    }
    
    console.log('Campanha encontrada:', campaign.subject);
    
    // Buscar subscritores ativos
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from('newsletter_subscribers')
      .select('*')
      .eq('status', 'active');
    
    if (subscribersError) {
      console.error('Erro ao buscar subscritores:', subscribersError);
      throw subscribersError;
    }
    
    console.log(`Enviando newsletter para ${subscribers.length} subscritores`);
    
    let sentCount = 0;
    const errors: { email: string; error: string }[] = [];
    
    // Enviar para cada subscritor
    for (const subscriber of subscribers) {
      const language = subscriber.language || 'pt';
      const subject = campaign.subject[language] || campaign.subject.pt;
      const content = campaign.content[language] || campaign.content.pt;
      
      // Sanitize HTML content before sending
      const sanitizedContent = sanitizeHtml(content);
      
      // Personalizar conteúdo
      const personalizedContent = sanitizedContent
        .replace(/\{\{nome\}\}/g, subscriber.full_name || 'Assinante')
        .replace(/\{\{email\}\}/g, subscriber.email)
        .replace(/\{\{unsubscribe_link\}\}/g, 
          `${Deno.env.get('SITE_URL')}/unsubscribe?token=${subscriber.id}`);
      
      // Wrap content in HTML document with CSP headers for XSS protection
      const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src https: data:; font-src https:;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif;">
  ${personalizedContent}
</body>
</html>`;
      
      try {
        // Enviar email via Resend API
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Newsletter <onboarding@resend.dev>',
            to: [subscriber.email],
            subject: subject,
            html: emailHtml,
            tags: {
              campaign_id: campaignId,
              subscriber_id: subscriber.id
            },
          }),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error(`Erro ao enviar para ${subscriber.email}:`, errorData);
          errors.push({ email: subscriber.email, error: JSON.stringify(errorData) });
        } else {
          sentCount++;
          console.log(`Email enviado com sucesso para ${subscriber.email}`);
        }
        
        // Delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Erro ao enviar para ${subscriber.email}:`, error);
        errors.push({ email: subscriber.email, error: String(error) });
      }
    }
    
    // Atualizar campanha
    await supabaseClient
      .from('newsletter_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        total_recipients: subscribers.length,
      })
      .eq('id', campaignId);
    
    console.log(`Newsletter enviada: ${sentCount} sucessos, ${errors.length} erros`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount,
        failed: errors.length,
        errors: errors 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Erro na função send-newsletter:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
