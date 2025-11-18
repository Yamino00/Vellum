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
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <FiBook className="text-2xl" />
            MyLibrary
          </Link>

          <div className="flex items-center gap-6">
            {userProfile?.is_admin ? (
              <>
                <Link to="/admin" className="hover:text-blue-200 flex items-center gap-2">
                  <FiHome />
                  Dashboard
                </Link>
                <Link to="/admin/books" className="hover:text-blue-200 flex items-center gap-2">
                  <FiBook />
                  Libri
                </Link>
                <Link to="/admin/users" className="hover:text-blue-200 flex items-center gap-2">
                  <FiUsers />
                  Utenti
                </Link>
                <Link to="/admin/loans" className="hover:text-blue-200 flex items-center gap-2">
                  <FiClipboard />
                  Prestiti
                </Link>
                <Link to="/admin/stats" className="hover:text-blue-200 flex items-center gap-2">
                  <FiBarChart2 />
                  Statistiche
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="hover:text-blue-200 flex items-center gap-2">
                  <FiHome />
                  Catalogo
                </Link>
                <Link to="/my-loans" className="hover:text-blue-200 flex items-center gap-2">
                  <FiClipboard />
                  I Miei Prestiti
                </Link>
              </>
            )}

            <div className="flex items-center gap-4 border-l border-blue-400 pl-4">
              <span className="text-sm">
                {userProfile?.nome} {userProfile?.cognome}
              </span>
              <button
                onClick={handleSignOut}
                className="hover:text-blue-200 flex items-center gap-2"
              >
                <FiLogOut />
                Esci
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
