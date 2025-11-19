# Deploy della Edge Function per la traduzione

Questa Edge Function serve a bypassare il problema CORS quando si chiama l'API di DeepL dal browser.

## Prerequisiti

1. Installa Supabase CLI:
```bash
npm install -g supabase
```

2. Login a Supabase:
```bash
supabase login
```

3. Link al progetto Supabase:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```
(Trova il project ref nel dashboard Supabase: Settings → General → Reference ID)

## Deploy della funzione

1. Imposta la chiave API DeepL come secret:
```bash
supabase secrets set DEEPL_API_KEY=97703bab-083a-42cb-99f0-473c5d02b349:fx
```

2. Deploy della funzione:
```bash
supabase functions deploy translate
```

## Test della funzione

Dopo il deploy, puoi testare la funzione:

```bash
curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/translate' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"text":"Hello world","target_lang":"IT"}'
```

## Verifica

Nel dashboard Supabase:
1. Vai su Edge Functions
2. Dovresti vedere la funzione "translate" deployata
3. Puoi vedere i logs per verificare che funzioni correttamente

## Note

- La funzione usa l'API gratuita di DeepL (https://api-free.deepl.com)
- Se hai un account pro, cambia l'URL in `index.ts` a: `https://api.deepl.com/v2/translate`
- La chiave API è salvata come secret e non è esposta nel codice
