import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ClientHome } from './pages/ClientHome';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminBooks } from './pages/AdminBooks';
import { AdminUsers } from './pages/AdminUsers';
import { AdminLoans } from './pages/AdminLoans';
import { AdminStats } from './pages/AdminStats';

function AppRoutes() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Caricamento...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {userProfile?.is_admin ? <Navigate to="/admin" replace /> : <ClientHome />}
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/books"
        element={
          <ProtectedRoute adminOnly>
            <AdminBooks />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/loans"
        element={
          <ProtectedRoute adminOnly>
            <AdminLoans />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/stats"
        element={
          <ProtectedRoute adminOnly>
            <AdminStats />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
