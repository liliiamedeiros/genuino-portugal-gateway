import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId } = await req.json();
    
    console.log('Iniciando envio da campanha:', campaignId);
    
    // Inicializar clientes
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
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
    const errors = [];
    
    // Enviar para cada subscritor
    for (const subscriber of subscribers) {
      const language = subscriber.language || 'pt';
      const subject = campaign.subject[language] || campaign.subject.pt;
      const content = campaign.content[language] || campaign.content.pt;
      
      // Personalizar conteúdo
      const personalizedContent = content
        .replace(/\{\{nome\}\}/g, subscriber.full_name || 'Assinante')
        .replace(/\{\{email\}\}/g, subscriber.email)
        .replace(/\{\{unsubscribe_link\}\}/g, 
          `${Deno.env.get('SITE_URL')}/unsubscribe?token=${subscriber.id}`);
      
      try {
        // Enviar email via Resend
        const { data, error } = await resend.emails.send({
          from: 'Newsletter <onboarding@resend.dev>',
          to: [subscriber.email],
          subject: subject,
          html: personalizedContent,
          tags: [
            { name: 'campaign_id', value: campaignId },
            { name: 'subscriber_id', value: subscriber.id }
          ],
        });
        
        if (error) {
          console.error(`Erro ao enviar para ${subscriber.email}:`, error);
          errors.push({ email: subscriber.email, error: error.message });
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
