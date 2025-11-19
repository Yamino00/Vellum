import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Stats {
  totalBooks: number;
  totalUsers: number;
  activeLoans: number;
  totalLoans: number;
  loansByGenre: { genere: string; count: number }[];
  topBooks: { titolo: string; count: number }[];
  loansByGender: { genere: string; count: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const AdminStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalUsers: 0,
    activeLoans: 0,
    totalLoans: 0,
    loansByGenre: [],
    topBooks: [],
    loansByGender: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Total books
      const { count: booksCount } = await supabase
        .from('libri')
        .select('*', { count: 'exact', head: true });

      // Total users
      const { count: usersCount } = await supabase
        .from('utenti')
        .select('*', { count: 'exact', head: true });

      // Active loans
      const { count: activeLoansCount } = await supabase
        .from('prestiti')
        .select('*', { count: 'exact', head: true })
        .is('data_restituzione', null);

      // Total loans
      const { count: totalLoansCount } = await supabase
        .from('prestiti')
        .select('*', { count: 'exact', head: true });

      // Loans by book genre
      const { data: loansData } = await supabase
        .from('prestiti')
        .select('libro:libri!inner(genere)');

      const genreCounts: Record<string, number> = {};
      loansData?.forEach((loan) => {
        const libro = loan.libro as unknown as { genere: string } | null;
        const genre = libro?.genere;
        if (genre) {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        }
      });

      const loansByGenre = Object.entries(genreCounts)
        .map(([genere, count]) => ({ genere, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Top books
      const { data: topBooksData } = await supabase
        .from('prestiti')
        .select('libro_id, libro:libri!inner(titolo)');

      const bookCounts: Record<string, { titolo: string; count: number }> = {};
      topBooksData?.forEach((loan) => {
        const bookId = loan.libro_id;
        const libro = loan.libro as unknown as { titolo: string } | null;
        const bookTitle = libro?.titolo || 'Sconosciuto';
        if (!bookCounts[bookId]) {
          bookCounts[bookId] = { titolo: bookTitle, count: 0 };
        }
        bookCounts[bookId].count++;
      });

      const topBooks = Object.values(bookCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Loans by user gender
      const { data: genderLoansData } = await supabase
        .from('prestiti')
        .select('utente:utenti!inner(genere)');

      const genderCounts: Record<string, number> = {};
      genderLoansData?.forEach((loan) => {
        const utente = loan.utente as unknown as { genere: string } | null;
        const gender = utente?.genere;
        if (gender) {
          genderCounts[gender] = (genderCounts[gender] || 0) + 1;
        }
      });

      const loansByGender = Object.entries(genderCounts).map(([genere, count]) => ({
        genere,
        count,
      }));

      setStats({
        totalBooks: booksCount || 0,
        totalUsers: usersCount || 0,
        activeLoans: activeLoansCount || 0,
        totalLoans: totalLoansCount || 0,
        loansByGenre,
        topBooks,
        loansByGender,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="w-full px-6 py-8">
          <p>Caricamento statistiche...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Statistiche e Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Libri Totali</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalBooks}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Utenti Registrati</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Prestiti Attivi</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.activeLoans}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Prestiti Totali</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.totalLoans}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Loans by Genre */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Prestiti per Genere Letterario
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.loansByGenre}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="genere" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="Numero Prestiti" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Loans by Gender */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Prestiti per Genere Utenti
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.loansByGender}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => {
                    const entry = stats.loansByGender[props.index];
                    return `${entry.genere}: ${entry.count}`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.loansByGender.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Books */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Libri Più Richiesti</h2>
          
          {stats.topBooks.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topBooks} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="titolo" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10B981" name="Numero Prestiti" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nessun dato disponibile. Crea dei prestiti per vedere le statistiche.
            </p>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📊 Informazioni sulle Statistiche
          </h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Le statistiche vengono aggiornate in tempo reale</li>
            <li>• I grafici mostrano i dati aggregati di tutti i prestiti</li>
            <li>• I "Libri Più Richiesti" includono sia i prestiti attivi che quelli restituiti</li>
            <li>• La distribuzione per genere utente mostra le preferenze di lettura</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
