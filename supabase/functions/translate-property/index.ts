import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title_pt, description_pt } = await req.json();

    // Input validation
    if (!title_pt || !description_pt) {
      return new Response(JSON.stringify({ error: 'Missing title_pt or description_pt' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize and validate input lengths
    const sanitizedTitle = title_pt.trim().slice(0, 500);
    const sanitizedDescription = description_pt.trim().slice(0, 10000);

    if (sanitizedTitle.length < 3) {
      return new Response(JSON.stringify({ error: 'Title too short (minimum 3 characters)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (sanitizedDescription.length < 10) {
      return new Response(JSON.stringify({ error: 'Description too short (minimum 10 characters)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `És um tradutor profissional especializado em imobiliário. 
Traduz os textos mantendo o tom profissional e formal do mercado imobiliário.
Retorna APENAS um objeto JSON válido com as traduções, sem texto adicional, sem markdown.
Formato exato: {"title_fr": "...", "title_en": "...", "title_de": "...", "description_fr": "...", "description_en": "...", "description_de": "..."}`;

    const userPrompt = `Traduz este anúncio imobiliário:

Título (PT): ${sanitizedTitle}
Descrição (PT): ${sanitizedDescription}

Traduz para:
- Francês (França)
- Inglês (Reino Unido)
- Alemão (Alemanha)`;

    console.log('Translating property:', { title_length: sanitizedTitle.length, description_length: sanitizedDescription.length });

    // Get Lovable API key from environment
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.warn('LOVABLE_API_KEY not configured - using Portuguese as fallback for all languages');
      return new Response(JSON.stringify({
        title_fr: sanitizedTitle,
        title_en: sanitizedTitle,
        title_de: sanitizedTitle,
        description_fr: sanitizedDescription,
        description_en: sanitizedDescription,
        description_de: sanitizedDescription,
        warning: 'Auto-translation unavailable - using Portuguese as fallback'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      console.error('AI translation error:', response.status, errorText);
      throw new Error(`AI translation failed: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content;
    
    console.log('Raw AI response:', translatedText);

    // Parse JSON da resposta, removendo possíveis markdown code blocks
    const cleanedText = translatedText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const translations = JSON.parse(cleanedText);

    console.log('Parsed translations:', translations);

    return new Response(JSON.stringify(translations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Translation failed',
      fallback: {
        title_fr: "Traduction en cours...",
        title_en: "Translation in progress...",
        title_de: "Übersetzung läuft...",
        description_fr: "Traduction en cours...",
        description_en: "Translation in progress...",
        description_de: "Übersetzung läuft..."
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
