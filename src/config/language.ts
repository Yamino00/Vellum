// Configurazione lingua dell'applicazione
// Questo file faciliterà il futuro supporto multi-lingua

export const APP_LANGUAGE = 'ita'; // Codice ISO 639-3 per italiano

// Mapping per eventuali altre lingue future
export const LANGUAGE_CODES = {
  italiano: 'ita',
  english: 'eng',
  español: 'spa',
  français: 'fre',
  deutsch: 'ger',
} as const;

export type SupportedLanguage = keyof typeof LANGUAGE_CODES;

// Funzione per ottenere il codice lingua corrente
// In futuro potrà leggere da contesto/localStorage/preferenze utente
export const getCurrentLanguage = (): string => {
  // TODO: Implementare lettura da contesto applicazione quando sarà disponibile il supporto multi-lingua
  return APP_LANGUAGE;
};
