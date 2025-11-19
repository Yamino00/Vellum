import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Loan } from '../types';
import { FiBook, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';

export const ClientLoans = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLoans = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('prestiti')
        .select(`
          *,
          libro:libri(*)
        `)
        .eq('utente_id', user.id)
        .order('data_prestito', { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLoans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleReturnBook = async (loanId: string) => {
    try {
      const { error } = await supabase
        .from('prestiti')
        .update({ data_restituzione: new Date().toISOString().split('T')[0] })
        .eq('id', loanId);

      if (error) throw error;

      // Aggiorna immediatamente lo stato locale
      setLoans(prevLoans =>
        prevLoans.map(loan =>
          loan.id === loanId
            ? { ...loan, data_restituzione: new Date().toISOString().split('T')[0] }
            : loan
        )
      );

      alert('Libro restituito con successo!');
    } catch (error) {
      console.error('Error returning book:', error);
      alert('Errore durante la restituzione del libro');
    }
  };

  const activeLoans = loans.filter((loan) => !loan.data_restituzione);
  const completedLoans = loans.filter((loan) => loan.data_restituzione);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="p-6 space-y-3">
                  <div className="skeleton h-6 w-3/4"></div>
                  <div className="skeleton h-4 w-1/2"></div>
                  <div className="skeleton h-4 w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-down">
          <h1 className="text-4xl font-bold text-gradient mb-2">I Miei Prestiti</h1>
          <p className="text-gray-600">Gestisci i tuoi libri in prestito</p>
        </div>

        {/* Prestiti Attivi */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiClock className="text-blue-600" />
            Prestiti Attivi
            <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {activeLoans.length}
            </span>
          </h2>

          {activeLoans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeLoans.map((loan, index) => (
                <div
                  key={loan.id}
                  className="card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {loan.libro?.cover_url ? (
                    <div className="relative overflow-hidden group">
                      <img
                        src={loan.libro.cover_url}
                        alt={loan.libro.titolo}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ) : (
                    <div className="gradient-animate h-48 flex items-center justify-center">
                      <FiBook className="text-white text-5xl opacity-80" />
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {loan.libro?.titolo}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1 font-medium">
                      {loan.libro?.autore}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">{loan.libro?.genere}</p>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <FiCalendar className="text-blue-600" />
                      <span>Prestito: {new Date(loan.data_prestito).toLocaleDateString('it-IT')}</span>
                    </div>

                    <button
                      onClick={() => handleReturnBook(loan.id)}
                      className="w-full px-4 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-glow hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle />
                      Restituisci
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="inline-block p-6 bg-blue-50 rounded-full mb-4">
                <FiBook className="text-5xl text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Nessun prestito attivo
              </h3>
              <p className="text-gray-500">
                Vai al catalogo per prendere in prestito un libro
              </p>
            </div>
          )}
        </div>

        {/* Storico Prestiti */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiCheckCircle className="text-green-600" />
            Storico Prestiti
            <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              {completedLoans.length}
            </span>
          </h2>

          {completedLoans.length > 0 ? (
            <div className="space-y-3">
              {completedLoans.map((loan, index) => (
                <div
                  key={loan.id}
                  className="card p-5 hover:shadow-md transition-shadow animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    {loan.libro?.cover_url ? (
                      <img
                        src={loan.libro.cover_url}
                        alt={loan.libro.titolo}
                        className="w-16 h-20 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-linear-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                        <FiBook className="text-white text-2xl" />
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {loan.libro?.titolo}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{loan.libro?.autore}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiCalendar className="text-blue-500" />
                          Prestito: {new Date(loan.data_prestito).toLocaleDateString('it-IT')}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCheckCircle className="text-green-500" />
                          Restituzione: {new Date(loan.data_restituzione!).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        <FiCheckCircle />
                        Restituito
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-gray-500">Nessun prestito completato</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
