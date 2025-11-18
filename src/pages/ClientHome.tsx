import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Book } from '../types';
import { FiSearch, FiBook } from 'react-icons/fi';

export const ClientHome = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('libri')
        .select('*')
        .order('titolo');

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLoan = async (bookId: string) => {
    if (!user) return;

    try {
      // Verifica se il libro è disponibile
      const book = books.find((b) => b.id === bookId);
      if (!book?.disponibile) {
        alert('Questo libro non è attualmente disponibile');
        return;
      }

      const { error } = await supabase.from('prestiti').insert([
        {
          utente_id: user.id,
          libro_id: bookId,
          data_prestito: new Date().toISOString().split('T')[0],
        },
      ]);

      if (error) throw error;

      alert('Richiesta di prestito inviata con successo!');
      fetchBooks();
    } catch (error) {
      console.error('Error requesting loan:', error);
      alert('Errore durante la richiesta del prestito');
    }
  };

  const genres = Array.from(new Set(books.map((book) => book.genere))).sort();

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.titolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.autore.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || book.genere === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Catalogo Libri</h1>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per titolo o autore..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tutti i generi</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-48 flex items-center justify-center">
                <FiBook className="text-white text-6xl" />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                  {book.titolo}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{book.autore}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{book.anno}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {book.genere}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${
                      book.disponibile ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {book.disponibile ? 'Disponibile' : 'Non disponibile'}
                  </span>

                  <button
                    onClick={() => handleRequestLoan(book.id)}
                    disabled={!book.disponibile}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      book.disponibile
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {book.disponibile ? 'Prendi in prestito' : 'Non disponibile'}
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-2">ISBN: {book.isbn}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FiBook className="text-6xl mx-auto mb-4 opacity-50" />
            <p>Nessun libro trovato</p>
          </div>
        )}
      </div>
    </div>
  );
};
