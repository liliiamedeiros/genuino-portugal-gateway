import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple HTML sanitizer for server-side (allows safe tags only)
function sanitizeHtml(html: string): string {
  const allowedTags = ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a', 'img', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'span', 'div', 'table', 'tr', 'td', 'th', 'tbody', 'thead'];
  const allowedAttrs = ['href', 'src', 'alt', 'class', 'style', 'target', 'width', 'height'];
  
  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript:/gi, '');
  
  return sanitized;
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
            html: personalizedContent,
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
