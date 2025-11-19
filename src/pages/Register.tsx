import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiBook } from 'react-icons/fi';

export const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
    cognome: '',
    genere: 'M' as 'M' | 'F' | 'Altro',
    eta: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    if (formData.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, {
        nome: formData.nome,
        cognome: formData.cognome,
        genere: formData.genere,
        eta: parseInt(formData.eta),
        email: formData.email,
        is_admin: false,
      });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="card max-w-2xl w-full p-8 animate-scale-in">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-violet-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
            <div className="relative p-4 bg-linear-to-br from-blue-600 to-violet-600 rounded-2xl shadow-lg">
              <FiBook className="text-4xl text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gradient mb-2">
          MyLibrary
        </h1>
        <p className="text-center text-gray-600 mb-6">Crea il tuo account</p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 animate-slide-down">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-2">
                Nome
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                value={formData.nome}
                onChange={handleChange}
                className="input"
                placeholder="Mario"
                required
              />
            </div>

            <div>
              <label htmlFor="cognome" className="block text-sm font-semibold text-gray-700 mb-2">
                Cognome
              </label>
              <input
                id="cognome"
                name="cognome"
                type="text"
                value={formData.cognome}
                onChange={handleChange}
                className="input"
                placeholder="Rossi"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="genere" className="block text-sm font-semibold text-gray-700 mb-2">
                Genere
              </label>
              <select
                id="genere"
                name="genere"
                value={formData.genere}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="M">Maschile</option>
                <option value="F">Femminile</option>
                <option value="Altro">Altro</option>
              </select>
            </div>

            <div>
              <label htmlFor="eta" className="block text-sm font-semibold text-gray-700 mb-2">
                Età
              </label>
              <input
                id="eta"
                name="eta"
                type="number"
                min="1"
                max="120"
                value={formData.eta}
                onChange={handleChange}
                className="input"
                placeholder="25"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder="tua@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Conferma Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-lg font-semibold mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrazione in corso...
              </span>
            ) : (
              'Registrati'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Hai già un account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
              Accedi qui
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};
