// Supabase Edge Function per tradurre testo con DeepL
// Serve a bypassare il problema CORS chiamando DeepL dal server invece che dal browser

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const DEEPL_API_KEY = Deno.env.get('DEEPL_API_KEY')
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, target_lang = 'IT' } = await req.json()

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!DEEPL_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'DeepL API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call DeepL API
    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        target_lang: target_lang,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepL API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: `DeepL API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify({ 
        translatedText: data.translations[0]?.text || text,
        detectedSourceLang: data.translations[0]?.detected_source_language
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
