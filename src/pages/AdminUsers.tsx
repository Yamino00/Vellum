import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import type { User } from '../types';
import { FiEdit2, FiSearch, FiX, FiSave, FiTrash2 } from 'react-icons/fi';

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('utenti')
        .select('*')
        .order('cognome');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (user: User) => {
    try {
      const { error } = await supabase
        .from('utenti')
        .update({ is_admin: !user.is_admin })
        .eq('id', user.id);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Errore durante l\'aggiornamento dell\'utente');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      cognome: user.cognome,
      email: user.email,
      genere: user.genere,
      eta: user.eta,
      is_admin: user.is_admin,
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('utenti')
        .update(formData)
        .eq('id', editingUser.id);

      if (error) throw error;
      
      setEditingUser(null);
      setFormData({});
      fetchUsers();
      alert('Utente aggiornato con successo');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Errore durante l\'aggiornamento dell\'utente');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo utente? Questa azione eliminerà anche tutti i prestiti associati.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('utenti')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      fetchUsers();
      alert('Utente eliminato con successo');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Errore durante l\'eliminazione dell\'utente');
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({});
  };

  const filteredUsers = users.filter(
    (user) =>
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cognome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestione Utenti</h1>

        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per nome, cognome o email..."
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
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cognome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Genere
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Età
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruolo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.cognome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.genere}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.eta}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_admin
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.is_admin ? 'Admin' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        title="Modifica utente"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => toggleAdmin(user)}
                        className="text-purple-600 hover:text-purple-900"
                        title={user.is_admin ? 'Rimuovi Admin' : 'Rendi Admin'}
                      >
                        {user.is_admin ? '👤' : '👑'}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        title="Elimina utente"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nessun utente trovato
            </div>
          )}
        </div>
      </div>

      {/* Modal di modifica */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Modifica Utente</h2>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cognome
                </label>
                <input
                  type="text"
                  value={formData.cognome || ''}
                  onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genere
                </label>
                <select
                  value={formData.genere || ''}
                  onChange={(e) => setFormData({ ...formData, genere: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="M">M</option>
                  <option value="F">F</option>
                  <option value="Altro">Altro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Età
                </label>
                <input
                  type="number"
                  value={formData.eta || ''}
                  onChange={(e) => setFormData({ ...formData, eta: parseInt(e.target.value) })}
                  min="1"
                  max="150"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={formData.is_admin || false}
                  onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_admin" className="ml-2 block text-sm text-gray-900">
                  Admin
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <FiSave />
                Salva
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center justify-center gap-2"
              >
                <FiX />
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
