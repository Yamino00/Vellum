import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Book } from '../types';
import { FiSearch, FiBook } from 'react-icons/fi';
import InfiniteMenu, { type MenuItem } from '../components/InfiniteMenu';

export const ClientHome = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
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
      setShowModal(false);
      setSelectedBook(null);
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

  const handleMenuItemClick = (_item: MenuItem, index: number) => {
    const book = filteredBooks[index % filteredBooks.length];
    setSelectedBook(book);
    setShowModal(true);
  };

  // Trasforma i libri in MenuItem per InfiniteMenu
  const menuItems: MenuItem[] = filteredBooks.map((book) => ({
    image: book.cover_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="512" height="512"%3E%3Crect fill="%231e293b" width="512" height="512"/%3E%3Ctext x="50%25" y="50%25" font-size="48" fill="%23fff" text-anchor="middle" dy=".3em"%3ELibro%3C/text%3E%3C/svg%3E',
    link: `#book-${book.id}`,
    title: book.titolo,
    description: book.descrizione || `${book.autore} - ${book.anno}`
  }));

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
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navbar />
      <div className="w-full h-screen flex flex-col">
        <div className="px-4 py-6 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto">
            <div className="mb-4">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Catalogo Libri</h1>
              <p className="text-gray-300">Esplora la nostra collezione in 3D</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Cerca per titolo o autore..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="md:w-64 px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-slate-900">Tutti i generi</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre} className="bg-slate-900">
                    {genre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          {filteredBooks.length > 0 ? (
            <InfiniteMenu items={menuItems} onItemClick={handleMenuItemClick} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <div className="inline-block p-6 bg-white/10 backdrop-blur-sm rounded-full shadow-lg mb-4">
                  <FiBook className="text-6xl text-white/50" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Nessun libro trovato</h3>
                <p className="text-gray-300">Prova a modificare i filtri di ricerca</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal per dettagli libro */}
      {showModal && selectedBook && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {selectedBook.cover_url ? (
                <img
                  src={selectedBook.cover_url}
                  alt={selectedBook.titolo}
                  className="w-full h-64 object-cover rounded-t-2xl"
                />
              ) : (
                <div className="w-full h-64 bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center rounded-t-2xl">
                  <FiBook className="text-white text-8xl opacity-80" />
                </div>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors shadow-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedBook.titolo}</h2>
              <p className="text-lg text-gray-600 mb-4">{selectedBook.autore}</p>

              <div className="flex items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {selectedBook.genere}
                </span>
                <span className="text-gray-600">{selectedBook.anno}</span>
                {selectedBook.disponibile ? (
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                    Disponibile
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 font-semibold">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    Non disponibile
                  </span>
                )}
              </div>

              {selectedBook.descrizione && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrizione</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedBook.descrizione}</p>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm text-gray-500">ISBN: <span className="font-mono">{selectedBook.isbn}</span></p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Chiudi
                </button>
                <button
                  onClick={() => handleRequestLoan(selectedBook.id)}
                  disabled={!selectedBook.disponibile}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedBook.disponibile
                      ? 'bg-linear-to-r from-blue-600 to-violet-600 text-white hover:shadow-lg hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedBook.disponibile ? 'Richiedi Prestito' : 'Non Disponibile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
