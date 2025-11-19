import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    // Calcular intervalo: 24h a partir de agora
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    console.log(`Buscando agendamentos entre ${now.toISOString()} e ${in24Hours.toISOString()}`);
    
    // Buscar agendamentos nas próximas 24h que não foram lembrados
    const { data: appointments, error: appointmentsError } = await supabaseClient
      .from('appointments')
      .select(`
        *,
        clients:client_id(id, full_name, email, phone),
        projects:property_id(id, title_pt, location, address)
      `)
      .gte('appointment_date', now.toISOString())
      .lte('appointment_date', in24Hours.toISOString())
      .eq('reminder_sent', false)
      .in('status', ['scheduled', 'confirmed']);
    
    if (appointmentsError) {
      console.error('Erro ao buscar agendamentos:', appointmentsError);
      throw appointmentsError;
    }
    
    console.log(`Encontrados ${appointments?.length || 0} agendamentos para lembrete`);
    
    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhum agendamento para lembrete' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let sentCount = 0;
    const errors = [];
    
    // Enviar lembrete para cada agendamento
    for (const appointment of appointments) {
      const client = appointment.clients;
      const project = appointment.projects;
      
      if (!client?.email) {
        console.log(`Cliente sem email para agendamento ${appointment.id}`);
        continue;
      }
      
      const appointmentDate = new Date(appointment.appointment_date);
      const formattedDate = appointmentDate.toLocaleDateString('pt-PT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const formattedTime = appointmentDate.toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const typeLabels: Record<string, string> = {
        viewing: 'Visita ao Imóvel',
        meeting: 'Reunião',
        call: 'Chamada Telefónica',
        video_call: 'Videochamada'
      };
      
      const emailSubject = `Lembrete: ${appointment.title} amanhã às ${formattedTime}`;
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background: #f9fafb; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #3b82f6; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Lembrete de Agendamento</h1>
            </div>
            <div class="content">
              <p>Olá ${client.full_name},</p>
              <p>Este é um lembrete do seu agendamento marcado para <strong>amanhã</strong>:</p>
              
              <div class="info-box">
                <h3>${appointment.title}</h3>
                <p><strong>Tipo:</strong> ${typeLabels[appointment.appointment_type] || appointment.appointment_type}</p>
                <p><strong>Data:</strong> ${formattedDate}</p>
                <p><strong>Hora:</strong> ${formattedTime}</p>
                <p><strong>Duração:</strong> ${appointment.duration_minutes} minutos</p>
                ${project ? `<p><strong>Imóvel:</strong> ${project.title_pt}</p>` : ''}
                ${appointment.location ? `<p><strong>Local:</strong> ${appointment.location}</p>` : ''}
              </div>
              
              ${appointment.description ? `<p><strong>Detalhes:</strong><br/>${appointment.description}</p>` : ''}
              
              <p>Se precisar reagendar ou cancelar, por favor entre em contacto connosco.</p>
              
              <p>Até breve!</p>
            </div>
            <div class="footer">
              <p>Este é um email automático. Por favor não responda.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      try {
        // Enviar email via Resend API
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Agendamentos <onboarding@resend.dev>',
            to: [client.email],
            subject: emailSubject,
            html: emailHtml,
            tags: {
              type: 'appointment_reminder',
              appointment_id: appointment.id
            },
          }),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error(`Erro ao enviar lembrete para ${client.email}:`, errorData);
          errors.push({ email: client.email, error: JSON.stringify(errorData) });
        } else {
          // Marcar como enviado
          await supabaseClient
            .from('appointments')
            .update({ reminder_sent: true })
            .eq('id', appointment.id);
          
          sentCount++;
          console.log(`Lembrete enviado com sucesso para ${client.email}`);
        }
        
        // Delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Erro ao processar agendamento ${appointment.id}:`, error);
        errors.push({ appointmentId: appointment.id, error: String(error) });
      }
    }
    
    console.log(`Lembretes enviados: ${sentCount} sucessos, ${errors.length} erros`);
    
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
    console.error('Erro na função send-appointment-reminders:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
