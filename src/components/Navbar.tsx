import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiBook, FiUsers, FiClipboard, FiBarChart2, FiLogOut, FiHome } from 'react-icons/fi';

export const Navbar = () => {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20">
      <div className={userProfile?.is_admin ? "w-full px-6" : "container mx-auto px-4"}>
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold flex items-center gap-3 hover:scale-105 transition-transform">
            <img 
              src="/Gestionale Libreria logo.png" 
              alt="Vellum Logo" 
              className="w-12 h-12 object-contain"
            />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent font-extrabold tracking-tight">
              Vellum
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {userProfile?.is_admin ? (
              <>
                <Link to="/admin" className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 transition-all">
                  <FiHome className="text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700 font-medium">Dashboard</span>
                </Link>
                <Link to="/admin/books" className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 transition-all">
                  <FiBook className="text-violet-600 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700 font-medium">Libri</span>
                </Link>
                <Link to="/admin/users" className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 transition-all">
                  <FiUsers className="text-pink-600 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700 font-medium">Utenti</span>
                </Link>
                <Link to="/admin/loans" className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 transition-all">
                  <FiClipboard className="text-orange-600 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700 font-medium">Prestiti</span>
                </Link>
                <Link to="/admin/stats" className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 transition-all">
                  <FiBarChart2 className="text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700 font-medium">Statistiche</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 transition-all">
                  <FiHome className="text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700 font-medium">Catalogo</span>
                </Link>
                <Link to="/my-loans" className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 transition-all">
                  <FiClipboard className="text-violet-600 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700 font-medium">I Miei Prestiti</span>
                </Link>
              </>
            )}

            <div className="flex items-center gap-3 border-l border-gray-300 pl-4 ml-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                  {userProfile?.nome?.[0]}{userProfile?.cognome?.[0]}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {userProfile?.nome} {userProfile?.cognome}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-all"
                title="Esci"
              >
                <FiLogOut className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
