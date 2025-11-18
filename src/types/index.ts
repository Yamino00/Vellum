export interface User {
  id: string;
  nome: string;
  cognome: string;
  genere: 'M' | 'F' | 'Altro';
  eta: number;
  email: string;
  is_admin: boolean;
  created_at?: string;
}

export interface Book {
  id: string;
  titolo: string;
  autore: string;
  anno: number;
  genere: string;
  isbn: string;
  disponibile: boolean;
  created_at?: string;
}

export interface Loan {
  id: string;
  utente_id: string;
  libro_id: string;
  data_prestito: string;
  data_restituzione: string | null;
  created_at?: string;
  // Relations
  utente?: User;
  libro?: Book;
}
