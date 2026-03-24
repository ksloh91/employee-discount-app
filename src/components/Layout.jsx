import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-950 text-slate-100 flex flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex flex-col items-start gap-0">
            <Link
              to="/"
              className="text-lg font-semibold tracking-tight text-slate-900 hover:text-primary"
            >
              <img src="/images/logo.png" alt="logo" className="w-26" />
              {/* Perkaholics Employee Discounts */}
            </Link>

            {user && (
              <div className="text-sm text-slate-500">
                Logged in as {user.displayName}
              </div>
            )}
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            {user?.role === "employee" && (
              <>
                <Link
                  to="/employee/deals"
                  className="rounded-full px-3 py-1 hover:text-primary"
                >
                  Deals
                </Link>
                <Link
                  to="/employee/redemptions"
                  className="rounded-full px-3 py-1 hover:text-primary"
                >
                  My Redemptions
                </Link>
              </>
            )}
            {user?.role === "corporate" && (
              <>
                <Link
                  to="/corporate/dashboard"
                  className="rounded-full px-3 py-1 hover:text-primary"
                >
                  Dashboard
                </Link>
                <Link
                  to="/corporate/invitations"
                  className="rounded-full px-3 py-1 hover:text-primary"
                >
                  Invite employees
                </Link>
              </>
            )}
            {user?.role === "merchant" && (
              <>
                <Link
                  to="/merchant/deals"
                  className="rounded-full px-3 py-1 hover:text-primary"
                >
                  My Deals
                </Link>
                <Link
                  to="/merchant/dashboard"
                  className="rounded-full px-3 py-1 hover:text-primary"
                >
                  Dashboard
                </Link>
              </>
            )}
            {user ? (
              <button
                type="button"
                className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary"
                onClick={handleLogout}
              >
                Log out
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-slate-950 shadow hover:bg-amber-400"
              >
                Log in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
