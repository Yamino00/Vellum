import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import type { Loan, User, Book } from '../types';
import { FiPlus, FiEdit2 } from 'react-icons/fi';

export const AdminLoans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    utente_id: '',
    libro_id: '',
    data_prestito: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    Promise.all([fetchLoans(), fetchUsers(), fetchBooks()]);
  }, []);

  const fetchLoans = async () => {
    try {
      const { data, error } = await supabase
        .from('prestiti')
        .select(`
          *,
          utente:utenti(nome, cognome, email),
          libro:libri(titolo, autore)
        `)
        .order('data_prestito', { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('utenti').select('*').order('cognome');
    setUsers(data || []);
  };

  const fetchBooks = async () => {
    const { data } = await supabase
      .from('libri')
      .select('*')
      .eq('disponibile', true)
      .order('titolo');
    setBooks(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('prestiti').insert([formData]);

      if (error) throw error;

      setIsModalOpen(false);
      resetForm();
      fetchLoans();
      fetchBooks();
    } catch (error) {
      console.error('Error creating loan:', error);
      alert('Errore durante la creazione del prestito');
    }
  };

  const handleReturn = async (loan: Loan) => {
    try {
      const { error } = await supabase
        .from('prestiti')
        .update({ data_restituzione: new Date().toISOString().split('T')[0] })
        .eq('id', loan.id);

      if (error) throw error;
      fetchLoans();
      fetchBooks();
    } catch (error) {
      console.error('Error returning book:', error);
      alert('Errore durante la restituzione del libro');
    }
  };

  const resetForm = () => {
    setFormData({
      utente_id: '',
      libro_id: '',
      data_prestito: new Date().toISOString().split('T')[0],
    });
  };

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
            <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Gestione Prestiti
            </span>
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus /> Nuovo Prestito
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Libro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Prestito
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Restituzione
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
              {loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {loan.utente?.nome} {loan.utente?.cognome}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {loan.libro?.titolo}
                    <br />
                    <span className="text-xs text-gray-400">{loan.libro?.autore}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(loan.data_prestito).toLocaleDateString('it-IT')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {loan.data_restituzione
                      ? new Date(loan.data_restituzione).toLocaleDateString('it-IT')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        loan.data_restituzione
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {loan.data_restituzione ? 'Restituito' : 'Attivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!loan.data_restituzione && (
                      <button
                        onClick={() => handleReturn(loan)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 ml-auto"
                      >
                        <FiEdit2 className="inline" />
                        Segna Restituito
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loans.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nessun prestito trovato
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Nuovo Prestito</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utente
                </label>
                <select
                  value={formData.utente_id}
                  onChange={(e) => setFormData({ ...formData, utente_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleziona un utente</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nome} {user.cognome} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Libro
                </label>
                <select
                  value={formData.libro_id}
                  onChange={(e) => setFormData({ ...formData, libro_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleziona un libro</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.titolo} - {book.autore}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Prestito
                </label>
                <input
                  type="date"
                  value={formData.data_prestito}
                  onChange={(e) =>
                    setFormData({ ...formData, data_prestito: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
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
                  Crea Prestito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
