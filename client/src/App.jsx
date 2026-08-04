import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import CategoriesPage from './pages/CategoriesPage';
import ReportsPage from './pages/ReportsPage';

function AuthenticatedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="main-content">{children}</main>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <AuthenticatedLayout>
            <DashboardPage />
          </AuthenticatedLayout>
        }
      />
      <Route
        path="/transactions"
        element={
          <AuthenticatedLayout>
            <TransactionsPage />
          </AuthenticatedLayout>
        }
      />
      <Route
        path="/categories"
        element={
          <AuthenticatedLayout>
            <CategoriesPage />
          </AuthenticatedLayout>
        }
      />
      <Route
        path="/reports"
        element={
          <AuthenticatedLayout>
            <ReportsPage />
          </AuthenticatedLayout>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
