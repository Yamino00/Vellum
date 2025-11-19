import { getCurrentLanguage } from '../config/language';

export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  subject?: string[];
  cover_i?: number;
  language?: string[];
}

export interface SearchFilters {
  title?: string;
  author?: string;
  isbn?: string;
  year?: number;
  genre?: string;
}

const BASE_URL = 'https://openlibrary.org';

export const searchBooks = async (filters: SearchFilters, language?: string): Promise<OpenLibraryBook[]> => {
  const params = new URLSearchParams();
  
  // Filtra per lingua corrente del sito (italiano di default)
  const currentLanguage = language || getCurrentLanguage();
  
  if (filters.title) params.append('title', filters.title);
  if (filters.author) params.append('author', filters.author);
  if (filters.isbn) params.append('isbn', filters.isbn);
  if (filters.year) params.append('first_publish_year', filters.year.toString());
  if (filters.genre) params.append('subject', filters.genre);
  
  params.append('limit', '50');
  params.append('fields', 'key,title,author_name,first_publish_year,isbn,subject,cover_i,language');

  try {
    const response = await fetch(`${BASE_URL}/search.json?${params.toString()}`);
    if (!response.ok) throw new Error('Errore nella ricerca su Open Library');
    
    const data = await response.json();
    const books = data.docs || [];
    
    // Ordina dando priorità ai libri in italiano
    const sortedBooks = books.sort((a: OpenLibraryBook, b: OpenLibraryBook) => {
      const aHasItalian = a.language && a.language.includes(currentLanguage);
      const bHasItalian = b.language && b.language.includes(currentLanguage);
      
      // Priorità 1: Libri con lingua italiana
      if (aHasItalian && !bHasItalian) return -1;
      if (!aHasItalian && bHasItalian) return 1;
      
      // Priorità 2: Titoli che contengono parole italiane comuni
      const italianWords = /\b(e|ed|i|il|la|le|lo|gli|delle|dei|degli|alla|al|nel|nella|con|per|da)\b/i;
      const aHasItalianTitle = italianWords.test(a.title);
      const bHasItalianTitle = italianWords.test(b.title);
      
      if (aHasItalianTitle && !bHasItalianTitle) return -1;
      if (!aHasItalianTitle && bHasItalianTitle) return 1;
      
      return 0;
    });
    
    // Restituisci al massimo 20 risultati (senza filtri aggressivi, solo ordinamento)
    return sortedBooks.slice(0, 20);
  } catch (error) {
    console.error('Errore Open Library API:', error);
    throw error;
  }
};

export const getCoverUrl = (coverId: number | undefined, size: 'S' | 'M' | 'L' = 'M'): string | null => {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};

export const getBookDescription = async (workKey: string): Promise<string | null> => {
  try {
    const response = await fetch(`${BASE_URL}${workKey}.json`);
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // La descrizione può essere una stringa o un oggetto con proprietà 'value'
    if (typeof data.description === 'string') {
      return data.description;
    } else if (data.description && typeof data.description === 'object' && 'value' in data.description) {
      return data.description.value;
    }
    
    return null;
  } catch (error) {
    console.error('Errore nel recupero della descrizione:', error);
    return null;
  }
};
