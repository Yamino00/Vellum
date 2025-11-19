const DEEPL_API_KEY = import.meta.env.VITE_DEEPL_API_KEY;
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

export const translateToItalian = async (text: string): Promise<string> => {
  if (!DEEPL_API_KEY) {
    console.warn('DeepL API key non configurata, restituisco testo originale');
    return text;
  }

  if (!text || text.trim() === '') {
    return '';
  }

  try {
    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        target_lang: 'IT',
      }),
    });

    if (!response.ok) {
      throw new Error(`Errore DeepL API: ${response.status}`);
    }

    const data = await response.json();
    return data.translations[0]?.text || text;
  } catch (error) {
    console.error('Errore nella traduzione:', error);
    // In caso di errore, restituisci il testo originale
    return text;
  }
};
