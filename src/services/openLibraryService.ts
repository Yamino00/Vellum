export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  subject?: string[];
  cover_i?: number;
}

export interface SearchFilters {
  title?: string;
  author?: string;
  isbn?: string;
  year?: number;
  genre?: string;
}

const BASE_URL = 'https://openlibrary.org';

export const searchBooks = async (filters: SearchFilters): Promise<OpenLibraryBook[]> => {
  const params = new URLSearchParams();
  
  if (filters.title) params.append('title', filters.title);
  if (filters.author) params.append('author', filters.author);
  if (filters.isbn) params.append('isbn', filters.isbn);
  if (filters.year) params.append('first_publish_year', filters.year.toString());
  if (filters.genre) params.append('subject', filters.genre);
  
  params.append('limit', '20');
  params.append('fields', 'key,title,author_name,first_publish_year,isbn,subject,cover_i');

  try {
    const response = await fetch(`${BASE_URL}/search.json?${params.toString()}`);
    if (!response.ok) throw new Error('Errore nella ricerca su Open Library');
    
    const data = await response.json();
    return data.docs || [];
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
