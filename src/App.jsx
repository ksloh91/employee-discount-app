import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DealsProvider } from './context/DealsContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DealsPage from './pages/employee/DealsPage';
import MyRedemptionsPage from './pages/employee/MyRedemptionsPage';
import DashboardPage from './pages/corporate/DashboardPage';
import MyDealsPage from './pages/merchant/MyDealsPage';
import AddDealsPage from './pages/merchant/AddDealsPage';
import EditDealPage from './pages/merchant/EditDealPage';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <DealsProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/employee/deals"
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <DealsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/redemptions"
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <MyRedemptionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/corporate/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['corporate']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/deals"
                element={
                  <ProtectedRoute allowedRoles={['merchant']}>
                    <MyDealsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/add-deal"
                element={
                  <ProtectedRoute allowedRoles={['merchant']}>
                    <AddDealsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/edit-deal/:id"
                element={
                  <ProtectedRoute allowedRoles={['merchant']}>
                    <EditDealPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DealsProvider>
    </AuthProvider>
  );
}
