import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * Wraps a route so it only renders when user is logged in with the required role.
 * Similar to Vue Router's navigation guards + meta.requiresAuth.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for Firebase auth state before deciding redirects.
  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-400">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const normalizedRole = String(user.role || "").trim().toLowerCase();
  const normalizedAllowedRoles = (allowedRoles || []).map((role) =>
    String(role).trim().toLowerCase(),
  );

  if (allowedRoles && !normalizedAllowedRoles.includes(normalizedRole)) {
    return <Navigate to="/" replace />;
  }

  // Corporate can temporarily suspend employee access.
  if (normalizedRole === "employee" && user.status === "suspended") {
    return <Navigate to="/" replace />;
  }

  return children;
}
