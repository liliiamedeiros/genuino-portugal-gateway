import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function getRateLimitKey(req: Request): string {
  // Use IP from headers or fallback to a default
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }
  
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }
  
  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const rateLimitKey = getRateLimitKey(req);
    const rateLimit = checkRateLimit(rateLimitKey);
    
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for ${rateLimitKey}`);
      return new Response(JSON.stringify({ 
        error: 'Too many requests. Please wait a moment before trying again.',
        reply: 'Por favor, aguarde um momento antes de enviar outra mensagem.'
      }), {
        status: 429,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000))
        },
      });
    }

    const { message, language = 'pt' } = await req.json();

    // Input validation
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize and limit message length
    const sanitizedMessage = message.trim().slice(0, 1000);
    
    if (sanitizedMessage.length === 0) {
      return new Response(JSON.stringify({ error: 'Message cannot be empty' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate language
    const validLanguages = ['pt', 'en', 'fr', 'de'];
    const safeLanguage = validLanguages.includes(language) ? language : 'pt';

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch active properties with basic info
    const { data: properties, error: dbError } = await supabase
      .from('projects')
      .select('id, title_pt, title_en, title_fr, title_de, description_pt, description_en, description_fr, description_de, location, region, city, property_type, operation_type, price, bedrooms, bathrooms, area_sqm, tags, features')
      .eq('status', 'active')
      .limit(50);

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to fetch properties');
    }

    // Build context for AI
    const propertyContext = properties?.map(p => {
      const titleKey = `title_${safeLanguage}` as keyof typeof p;
      const descKey = `description_${safeLanguage}` as keyof typeof p;
      const title = p[titleKey] || p.title_pt;
      const desc = p[descKey] || p.description_pt;
      return `
Imóvel: ${title}
Localização: ${p.city || p.location}, ${p.region}
Tipo: ${p.property_type}
Operação: ${p.operation_type}
Preço: ${p.price ? `€${p.price}` : 'Sob consulta'}
Quartos: ${p.bedrooms || 'N/A'}
Casas de banho: ${p.bathrooms || 'N/A'}
Área: ${p.area_sqm ? `${p.area_sqm}m²` : 'N/A'}
Tags: ${p.tags?.join(', ') || 'N/A'}
Descrição: ${String(desc).substring(0, 200)}...
      `.trim();
    }).join('\n\n---\n\n') || 'Nenhum imóvel disponível no momento.';

    const systemPrompts: Record<string, string> = {
      pt: `És um assistente virtual especializado em imobiliário em Portugal. Ajudas clientes a encontrar o imóvel ideal.
Responde sempre em português de forma profissional, amigável e concisa.
Usa os dados dos imóveis disponíveis para responder às perguntas.
Se não tiveres informação suficiente, pede mais detalhes ao cliente.
Foca-te nas características que o cliente valoriza (localização, preço, tamanho, etc.).`,
      en: `You are a virtual assistant specializing in Portuguese real estate. You help clients find their ideal property.
Always respond in English in a professional, friendly, and concise manner.
Use the available property data to answer questions.
If you don't have enough information, ask the client for more details.
Focus on the characteristics the client values (location, price, size, etc.).`,
      fr: `Vous êtes un assistant virtuel spécialisé dans l'immobilier au Portugal. Vous aidez les clients à trouver leur propriété idéale.
Répondez toujours en français de manière professionnelle, amicale et concise.
Utilisez les données des propriétés disponibles pour répondre aux questions.
Si vous n'avez pas assez d'informations, demandez plus de détails au client.
Concentrez-vous sur les caractéristiques que le client valorise (emplacement, prix, taille, etc.).`,
      de: `Sie sind ein virtueller Assistent, der sich auf portugiesische Immobilien spezialisiert hat. Sie helfen Kunden, ihre ideale Immobilie zu finden.
Antworten Sie immer auf Deutsch in professioneller, freundlicher und prägnanter Weise.
Verwenden Sie die verfügbaren Immobiliendaten, um Fragen zu beantworten.
Wenn Sie nicht genügend Informationen haben, fragen Sie den Kunden nach weiteren Details.
Konzentrieren Sie sich auf die Merkmale, die der Kunde schätzt (Standort, Preis, Größe usw.).`
    };

    const systemPrompt = systemPrompts[safeLanguage] || systemPrompts.pt;

    const userPrompt = `Contexto dos imóveis disponíveis:

${propertyContext}

Pergunta do cliente: ${sanitizedMessage}`;

    console.log('Processing chatbot query:', { language: safeLanguage, messageLength: sanitizedMessage.length, propertiesCount: properties?.length, rateLimitRemaining: rateLimit.remaining });

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.warn('LOVABLE_API_KEY not configured - returning helpful fallback message');
      
      const fallbackMessages: Record<string, string> = {
        pt: 'Obrigado pela sua mensagem! Para mais informações sobre os nossos imóveis, por favor contacte-nos através do formulário de contacto ou envie-nos um email.',
        en: 'Thank you for your message! For more information about our properties, please contact us through our contact form or send us an email.',
        fr: 'Merci pour votre message! Pour plus d\'informations sur nos propriétés, veuillez nous contacter via notre formulaire de contact ou nous envoyer un email.',
        de: 'Vielen Dank für Ihre Nachricht! Für weitere Informationen über unsere Immobilien kontaktieren Sie uns bitte über unser Kontaktformular oder senden Sie uns eine E-Mail.',
      };
      
      return new Response(JSON.stringify({ 
        reply: fallbackMessages[safeLanguage] || fallbackMessages.pt
      }), {
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rateLimit.remaining)
        },
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    console.log('Chatbot response generated successfully');

    return new Response(JSON.stringify({ reply }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(rateLimit.remaining)
      },
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    
    const fallbackMessages: Record<string, string> = {
      pt: 'Desculpe, ocorreu um erro. Por favor, tente novamente ou contacte-nos diretamente.',
      en: 'Sorry, an error occurred. Please try again or contact us directly.',
      fr: 'Désolé, une erreur s\'est produite. Veuillez réessayer ou nous contacter directement.',
      de: 'Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.'
    };

    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Chatbot error',
      reply: fallbackMessages.pt
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
