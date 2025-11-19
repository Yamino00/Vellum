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
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="skeleton h-64 w-full"></div>
                <div className="p-4 space-y-3">
                  <div className="skeleton h-6 w-3/4"></div>
                  <div className="skeleton h-4 w-1/2"></div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-10 w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-down">
          <h1 className="text-4xl font-bold text-gradient mb-2">Catalogo Libri</h1>
          <p className="text-gray-600">Esplora la nostra collezione e trova il tuo prossimo libro</p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4 animate-fade-in">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Cerca per titolo o autore..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-12"
            />
          </div>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="input md:w-64"
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
          {filteredBooks.map((book, index) => (
            <div
              key={book.id}
              className="card-hover animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {book.cover_url ? (
                <div className="relative overflow-hidden group">
                  <img
                    src={book.cover_url}
                    alt={book.titolo}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ) : (
                <div className="gradient-animate h-64 flex items-center justify-center">
                  <FiBook className="text-white text-6xl opacity-80" />
                </div>
              )}

              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
                  {book.titolo}
                </h3>
                <p className="text-sm text-gray-600 mb-2 font-medium">{book.autore}</p>

                {book.descrizione && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-3 leading-relaxed">
                    {book.descrizione}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="font-medium">{book.anno}</span>
                  <span className="badge-primary">
                    {book.genere}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {book.disponibile ? (
                    <span className="badge-success flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                      Disponibile
                    </span>
                  ) : (
                    <span className="badge-danger flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      Non disponibile
                    </span>
                  )}

                  <button
                    onClick={() => handleRequestLoan(book.id)}
                    disabled={!book.disponibile}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      book.disponibile
                        ? 'bg-linear-to-r from-blue-600 to-violet-600 text-white hover:shadow-glow hover:scale-105'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {book.disponibile ? 'Prendi in prestito' : 'Non disponibile'}
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-3 font-mono">ISBN: {book.isbn}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-block p-6 bg-white/80 backdrop-blur-sm rounded-full shadow-soft mb-4">
              <FiBook className="text-6xl text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Nessun libro trovato</h3>
            <p className="text-gray-500">Prova a modificare i filtri di ricerca</p>
          </div>
        )}
      </div>
    </div>
  );
};
