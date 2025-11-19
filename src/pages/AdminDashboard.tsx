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
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-down">
          <h1 className="text-4xl font-bold text-gradient mb-2">Dashboard Admin</h1>
          <p className="text-gray-600">Panoramica generale del sistema</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="skeleton h-12 w-12 rounded-lg mb-4"></div>
                <div className="skeleton h-8 w-20 mb-2"></div>
                <div className="skeleton h-4 w-32"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link to="/admin/books" className="card-hover p-6 group animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                    Libri Totali
                  </h3>
                  <div className="p-3 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-glow transition-shadow">
                    <FiBook className="text-3xl text-white" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-gradient mb-2">{stats.totalBooks}</p>
                <p className="text-sm text-gray-600 font-medium">
                  {stats.availableBooks} disponibili
                </p>
              </Link>

              <Link to="/admin/users" className="card-hover p-6 group animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                    Utenti
                  </h3>
                  <div className="p-3 bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:shadow-glow transition-shadow">
                    <FiUsers className="text-3xl text-white" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-gradient mb-2">{stats.totalUsers}</p>
                <p className="text-sm text-gray-600 font-medium">Utenti registrati</p>
              </Link>

              <Link to="/admin/loans" className="card-hover p-6 group animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                    Prestiti Attivi
                  </h3>
                  <div className="p-3 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-glow transition-shadow">
                    <FiClipboard className="text-3xl text-white" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-gradient mb-2">{stats.activeLoans}</p>
                <p className="text-sm text-gray-600 font-medium">In corso</p>
              </Link>

              <Link to="/admin/stats" className="card-hover p-6 group animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">
                    Statistiche
                  </h3>
                  <div className="p-3 bg-linear-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-glow transition-shadow">
                    <FiBarChart2 className="text-3xl text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 font-medium">Visualizza grafici e analisi dettagliate</p>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="card p-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Azioni Rapide</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/admin/books"
                  className="group flex items-center gap-4 p-5 border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all hover:shadow-md"
                >
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FiBook className="text-2xl text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Gestisci Libri</p>
                    <p className="text-sm text-gray-600">Aggiungi o modifica libri</p>
                  </div>
                </Link>

                <Link
                  to="/admin/loans"
                  className="group flex items-center gap-4 p-5 border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all hover:shadow-md"
                >
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <FiClipboard className="text-2xl text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors">Nuovo Prestito</p>
                    <p className="text-sm text-gray-600">Crea un nuovo prestito</p>
                  </div>
                </Link>

                <Link
                  to="/admin/stats"
                  className="group flex items-center gap-4 p-5 border-2 border-orange-200 rounded-xl hover:bg-orange-50 hover:border-orange-400 transition-all hover:shadow-md"
                >
                  <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <FiBarChart2 className="text-2xl text-orange-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">Vedi Statistiche</p>
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
