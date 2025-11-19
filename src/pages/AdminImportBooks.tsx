import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { searchBooks, getCoverUrl, getBookDescription, type OpenLibraryBook, type SearchFilters } from '../services/openLibraryService';
import { translateToItalian } from '../services/deeplService';

export default function AdminImportBooks() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<OpenLibraryBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const books = await searchBooks(filters);
      setResults(books);
    } catch (error) {
      console.error('Errore nella ricerca:', error);
      alert('Errore nella ricerca su Open Library');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (book: OpenLibraryBook) => {
    setImporting(book.key);
    try {
      // Recupera la descrizione dal work
      let description = await getBookDescription(book.key);
      console.log('Descrizione originale:', description?.substring(0, 100));
      
      // Traduci la descrizione in italiano se esiste
      if (description) {
        try {
          const translatedDescription = await translateToItalian(description);
          console.log('Descrizione tradotta:', translatedDescription?.substring(0, 100));
          description = translatedDescription;
        } catch (translateError) {
          console.error('Errore nella traduzione:', translateError);
          // Continua con la descrizione originale se la traduzione fallisce
        }
      }

      // Determina il genere dal primo subject disponibile
      const genere = book.subject?.[0] || 'Non specificato';

      // Prepara i dati del libro
      const bookData = {
        titolo: book.title,
        autore: book.author_name?.[0] || 'Autore sconosciuto',
        anno: book.first_publish_year || new Date().getFullYear(),
        genere: genere,
        isbn: book.isbn?.[0] || `OL-${Date.now()}`, // Genera un ISBN temporaneo se mancante
        descrizione: description || null,
        cover_url: getCoverUrl(book.cover_i, 'L') || null,
        disponibile: true,
      };

      console.log('Dati libro da salvare:', { ...bookData, descrizione: bookData.descrizione?.substring(0, 100) });

      // Inserisci nel database
      const { error } = await supabase
        .from('libri')
        .insert([bookData]);

      if (error) throw error;

      alert('Libro importato con successo!');
      // Rimuovi il libro dai risultati
      setResults(results.filter(b => b.key !== book.key));
    } catch (error) {
      console.error('Errore nell\'importazione:', error);
      if (error instanceof Error) {
        alert(`Errore nell'importazione: ${error.message}`);
      } else {
        alert('Errore nell\'importazione del libro');
      }
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Importa Libri da Open Library</h1>
          <button
            onClick={() => navigate('/admin/books')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Torna ai Libri
          </button>
        </div>

        {/* Form di ricerca */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titolo
                </label>
                <input
                  type="text"
                  value={filters.title || ''}
                  onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="es. Harry Potter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autore
                </label>
                <input
                  type="text"
                  value={filters.author || ''}
                  onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="es. J.K. Rowling"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISBN
                </label>
                <input
                  type="text"
                  value={filters.isbn || ''}
                  onChange={(e) => setFilters({ ...filters, isbn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="es. 9780439708180"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anno
                </label>
                <input
                  type="number"
                  value={filters.year || ''}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="es. 1997"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genere
                </label>
                <select
                  value={filters.genre || ''}
                  onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tutti i generi</option>
                  <option value="fiction">Fiction</option>
                  <option value="fantasy">Fantasy</option>
                  <option value="science_fiction">Fantascienza</option>
                  <option value="mystery_and_detective_stories">Giallo</option>
                  <option value="thriller">Thriller</option>
                  <option value="romance">Romantico</option>
                  <option value="horror">Horror</option>
                  <option value="historical_fiction">Storico</option>
                  <option value="humor">Umorismo</option>
                  <option value="literature">Letteratura</option>
                  <option value="poetry">Poesia</option>
                  <option value="plays">Teatro</option>
                  <option value="short_stories">Racconti</option>
                  <option value="young_adult_fiction">Young Adult</option>
                  <option value="juvenile_fiction">Ragazzi</option>
                  <option value="biography">Biografia</option>
                  <option value="autobiography">Autobiografia</option>
                  <option value="history">Storia</option>
                  <option value="philosophy">Filosofia</option>
                  <option value="psychology">Psicologia</option>
                  <option value="self-help">Self-help</option>
                  <option value="business">Business</option>
                  <option value="cooking">Cucina</option>
                  <option value="art">Arte</option>
                  <option value="music">Musica</option>
                  <option value="photography">Fotografia</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Ricerca in corso...' : 'Cerca'}
              </button>
            </div>
          </form>
        </div>

        {/* Risultati */}
        {results.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Risultati ({results.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((book) => (
                <div key={book.key} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {book.cover_i && (
                    <img
                      src={getCoverUrl(book.cover_i, 'M') || ''}
                      alt={book.title}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  {!book.cover_i && (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Nessuna copertina</span>
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {book.author_name?.[0] || 'Autore sconosciuto'}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      {book.first_publish_year || 'Anno non disponibile'}
                    </p>
                    {book.subject && book.subject.length > 0 && (
                      <p className="text-xs text-gray-400 mb-3 line-clamp-1">
                        {book.subject.slice(0, 2).join(', ')}
                      </p>
                    )}
                    
                    <button
                      onClick={() => handleImport(book)}
                      disabled={importing === book.key}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-sm"
                    >
                      {importing === book.key ? 'Importazione...' : 'Aggiungi alla Libreria'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">
              Usa i filtri sopra per cercare libri su Open Library
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
