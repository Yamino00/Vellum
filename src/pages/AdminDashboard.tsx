import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { FiBook, FiUsers, FiClipboard, FiBarChart2 } from 'react-icons/fi';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    totalUsers: 0,
    activeLoans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [booksRes, availableBooksRes, usersRes, activeLoansRes] = await Promise.all([
        supabase.from('libri').select('*', { count: 'exact', head: true }),
        supabase.from('libri').select('*', { count: 'exact', head: true }).eq('disponibile', true),
        supabase.from('utenti').select('*', { count: 'exact', head: true }),
        supabase.from('prestiti').select('*', { count: 'exact', head: true }).is('data_restituzione', null),
      ]);

      setStats({
        totalBooks: booksRes.count || 0,
        availableBooks: availableBooksRes.count || 0,
        totalUsers: usersRes.count || 0,
        activeLoans: activeLoansRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Admin</h1>

        {loading ? (
          <p>Caricamento...</p>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link to="/admin/books" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Libri Totali</h3>
                  <FiBook className="text-3xl text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">{stats.totalBooks}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {stats.availableBooks} disponibili
                </p>
              </Link>

              <Link to="/admin/users" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Utenti</h3>
                  <FiUsers className="text-3xl text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
                <p className="text-sm text-gray-500 mt-2">Utenti registrati</p>
              </Link>

              <Link to="/admin/loans" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Prestiti Attivi</h3>
                  <FiClipboard className="text-3xl text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-600">{stats.activeLoans}</p>
                <p className="text-sm text-gray-500 mt-2">In corso</p>
              </Link>

              <Link to="/admin/stats" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Statistiche</h3>
                  <FiBarChart2 className="text-3xl text-orange-600" />
                </div>
                <p className="text-sm text-gray-600 mt-4">Visualizza grafici e analisi dettagliate</p>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Azioni Rapide</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/admin/books"
                  className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <FiBook className="text-2xl text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Gestisci Libri</p>
                    <p className="text-sm text-gray-500">Aggiungi o modifica libri</p>
                  </div>
                </Link>

                <Link
                  to="/admin/loans"
                  className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <FiClipboard className="text-2xl text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Nuovo Prestito</p>
                    <p className="text-sm text-gray-500">Crea un nuovo prestito</p>
                  </div>
                </Link>

                <Link
                  to="/admin/stats"
                  className="flex items-center gap-3 p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <FiBarChart2 className="text-2xl text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Vedi Statistiche</p>
                    <p className="text-sm text-gray-500">Analisi e report</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                👋 Benvenuto nella Dashboard Admin
              </h3>
              <p className="text-blue-800">
                Da qui puoi gestire tutti gli aspetti della libreria: libri, utenti e prestiti.
                Usa il menu di navigazione in alto per accedere alle diverse sezioni.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
