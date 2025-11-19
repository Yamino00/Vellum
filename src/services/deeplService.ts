import { supabase } from '../lib/supabase';

export const translateToItalian = async (text: string): Promise<string> => {
  if (!text || text.trim() === '') {
    return '';
  }

  console.log('Invio richiesta di traduzione tramite Supabase Edge Function...');

  try {
    // Usa la Edge Function di Supabase per bypassare CORS
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { text, target_lang: 'IT' }
    });

    if (error) {
      console.error('Errore nella chiamata Edge Function:', error);
      throw error;
    }

    if (data?.error) {
      console.error('Errore DeepL API tramite Edge Function:', data.error);
      throw new Error(data.error);
    }

    const translatedText = data?.translatedText || text;
    console.log('Traduzione completata con successo');
    console.log('Lingua rilevata:', data?.detectedSourceLang);
    return translatedText;
  } catch (error) {
    console.error('Errore nella traduzione:', error);
    console.warn('Uso il testo originale senza traduzione');
    // In caso di errore, restituisci il testo originale
    return text;
  }
};
