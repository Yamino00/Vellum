import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import type { Book } from '../types';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiDownload } from 'react-icons/fi';

export const AdminBooks = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    titolo: '',
    autore: '',
    anno: new Date().getFullYear(),
    genere: '',
    isbn: '',
    cover_url: '',
    descrizione: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBook) {
        const { error } = await supabase
          .from('libri')
          .update(formData)
          .eq('id', editingBook.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('libri').insert([formData]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingBook(null);
      resetForm();
      fetchBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Errore durante il salvataggio del libro');
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      titolo: book.titolo,
      autore: book.autore,
      anno: book.anno,
      genere: book.genere,
      isbn: book.isbn,
      cover_url: book.cover_url || '',
      descrizione: book.descrizione || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo libro?')) return;

    try {
      const { error } = await supabase.from('libri').delete().eq('id', id);

      if (error) throw error;
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Errore durante l\'eliminazione del libro');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verifica che sia un'immagine
    if (!file.type.startsWith('image/')) {
      alert('Per favore seleziona un file immagine');
      return;
    }

    // Verifica dimensione (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'immagine deve essere inferiore a 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Genera un nome file unico
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `book-covers/${fileName}`;

      // Carica il file su Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Ottieni l'URL pubblico
      const { data } = supabase.storage
        .from('covers')
        .getPublicUrl(filePath);

      // Aggiorna il form con l'URL
      setFormData({ ...formData, cover_url: data.publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Errore durante il caricamento dell\'immagine. Assicurati che il bucket "covers" sia stato creato in Supabase Storage.');
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titolo: '',
      autore: '',
      anno: new Date().getFullYear(),
      genere: '',
      isbn: '',
      cover_url: '',
      descrizione: '',
    });
  };

  const openAddModal = () => {
    setEditingBook(null);
    resetForm();
    setIsModalOpen(true);
  };

  const filteredBooks = books.filter(
    (book) =>
      book.titolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.autore.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.genere.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="w-full px-6 py-8">
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold">
            <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-violet-700 bg-clip-text text-transparent">
              Gestione Libri
            </span>
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/import-books')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FiDownload /> Importa da Open Library
            </button>
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FiPlus /> Aggiungi Libro
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per titolo, autore o genere..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titolo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Autore
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Genere
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISBN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {book.titolo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.autore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.anno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.genere}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.isbn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        book.disponibile
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {book.disponibile ? 'Disponibile' : 'In prestito'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(book)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <FiEdit2 className="inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBooks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nessun libro trovato
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
            <h2 className="text-2xl font-bold mb-4">
              {editingBook ? 'Modifica Libro' : 'Aggiungi Libro'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titolo
                </label>
                <input
                  type="text"
                  value={formData.titolo}
                  onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Autore
                </label>
                <input
                  type="text"
                  value={formData.autore}
                  onChange={(e) => setFormData({ ...formData, autore: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anno
                  </label>
                  <input
                    type="number"
                    value={formData.anno}
                    onChange={(e) =>
                      setFormData({ ...formData, anno: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genere
                  </label>
                  <input
                    type="text"
                    value={formData.genere}
                    onChange={(e) => setFormData({ ...formData, genere: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Copertina
                </label>
                
                {/* Carica File */}
                <div className="mb-3">
                  <label className="block">
                    <span className="sr-only">Scegli file immagine</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </label>
                  {uploadingImage && (
                    <p className="text-sm text-blue-600 mt-1">Caricamento in corso...</p>
                  )}
                </div>

                {/* Oppure URL */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">oppure inserisci URL</span>
                  </div>
                </div>

                <input
                  type="url"
                  value={formData.cover_url}
                  onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                  className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://esempio.com/copertina.jpg"
                />
                
                {formData.cover_url && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Anteprima:</p>
                    <img
                      src={formData.cover_url}
                      alt="Anteprima copertina"
                      className="w-32 h-48 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={formData.descrizione}
                  onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Descrizione del libro..."
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBook(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingBook ? 'Salva Modifiche' : 'Aggiungi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
