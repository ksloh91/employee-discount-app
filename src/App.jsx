import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { DealsProvider } from './context/DealsContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/ToastProvider';
import { ConfirmProvider } from './components/ConfirmProvider';
import './App.css';

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DealsPage = lazy(() => import("./pages/employee/DealsPage"));
const MyRedemptionsPage = lazy(() => import("./pages/employee/MyRedemptionsPage"));
const DashboardPage = lazy(() => import("./pages/corporate/DashboardPage"));
const InvitationsPage = lazy(() => import("./pages/corporate/InvitationsPage"));
const EmployeesPage = lazy(() => import("./pages/corporate/EmployeesPage"));
const MyDealsPage = lazy(() => import("./pages/merchant/MyDealsPage"));
const AddDealsPage = lazy(() => import("./pages/merchant/AddDealsPage"));
const EditDealPage = lazy(() => import("./pages/merchant/EditDealPage"));
const MerchantDashboardPage = lazy(() => import("./pages/merchant/MerchantDashboardPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));

function RouteFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-300 backdrop-blur-xl">
        Loading page...
      </div>
    </div>
  );
}

// Must match vite `base` (e.g. /employee-discount-app/ on GitHub Pages)
const routerBasename =
  import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL.replace(/\/$/, "");

export default function App() {
  return (
    <AuthProvider>
      <DealsProvider>
        <ToastProvider>
          <ConfirmProvider>
            <BrowserRouter basename={routerBasename}>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route
                      path="/employee/deals"
                      element={
                        <ProtectedRoute allowedRoles={["employee"]}>
                          <DealsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/employee/redemptions"
                      element={
                        <ProtectedRoute allowedRoles={["employee"]}>
                          <MyRedemptionsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/corporate/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={["corporate"]}>
                          <DashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/corporate/invitations"
                      element={
                        <ProtectedRoute allowedRoles={["corporate"]}>
                          <InvitationsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/corporate/employees"
                      element={
                        <ProtectedRoute allowedRoles={["corporate"]}>
                          <EmployeesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/merchant/deals"
                      element={
                        <ProtectedRoute allowedRoles={["merchant"]}>
                          <MyDealsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/merchant/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={["merchant"]}>
                          <MerchantDashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/merchant/add-deal"
                      element={
                        <ProtectedRoute allowedRoles={["merchant"]}>
                          <AddDealsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/merchant/edit-deal/:id"
                      element={
                        <ProtectedRoute allowedRoles={["merchant"]}>
                          <EditDealPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ConfirmProvider>
        </ToastProvider>
      </DealsProvider>
    </AuthProvider>
  );
}
