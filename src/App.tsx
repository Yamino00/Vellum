import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthCallback } from './pages/AuthCallback';
import { CompleteProfile } from './pages/CompleteProfile';
import { ClientHome } from './pages/ClientHome';
import { ClientLoans } from './pages/ClientLoans';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminBooks } from './pages/AdminBooks';
import { AdminUsers } from './pages/AdminUsers';
import { AdminLoans } from './pages/AdminLoans';
import { AdminStats } from './pages/AdminStats';
import AdminImportBooks from './pages/AdminImportBooks';

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
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/complete-profile"
        element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {userProfile?.is_admin ? <Navigate to="/admin" replace /> : <ClientHome />}
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/my-loans"
        element={
          <ProtectedRoute>
            <ClientLoans />
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
        path="/admin/import-books"
        element={
          <ProtectedRoute adminOnly>
            <AdminImportBooks />
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
