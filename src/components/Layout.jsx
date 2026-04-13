import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import EmployeeNavTutorial from "./EmployeeNavTutorial";
import {
  ArrowLeft,
  LayoutDashboard,
  MailPlus,
  Ticket,
  Users,
  BadgePercent,
  Store,
  History,
  House,
} from "lucide-react";

const desktopNavLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-tight transition-all duration-200 ${
    isActive
      ? "border-amber-500/80 bg-amber-400/30 text-slate-900 shadow-sm ring-1 ring-amber-500/25"
      : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-900/[0.06] hover:text-slate-900"
  }`;

const mobileTabClass =
  "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-slate-200 transition-transform duration-200 active:scale-95";
  
export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  useEffect(() => {
    if (!user?.role) return;

    // Prefetch likely next screens by role after authentication.
    if (user.role === "employee") {
      void import("../pages/employee/DealsPage");
      void import("../pages/employee/MyRedemptionsPage");
      return;
    }

    if (user.role === "corporate") {
      void import("../pages/corporate/DashboardPage");
      void import("../pages/corporate/InvitationsPage");
      void import("../pages/corporate/EmployeesPage");
      return;
    }

    if (user.role === "merchant") {
      void import("../pages/merchant/MyDealsPage");
      void import("../pages/merchant/MerchantDashboardPage");
      void import("../pages/merchant/AddDealsPage");
    }
  }, [user?.role]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[radial-gradient(circle_at_12%_20%,rgba(255,186,0,0.2),transparent_35%),radial-gradient(circle_at_88%_0%,rgba(99,102,241,0.28),transparent_38%),linear-gradient(180deg,#020617_0%,#0b1120_48%,#020617_100%)] text-slate-100">
      <header className="sticky top-0 z-20 bg-[#EFF4FB]/95 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-3 items-center px-4 py-3 sm:hidden">
          <button
            type="button"
            onClick={handleGoBack}
            aria-label="Go back"
            className="inline-flex size-9 items-center justify-center justify-self-start rounded-full border border-slate-300 bg-white text-slate-800 shadow-sm transition hover:border-amber-500/55 hover:bg-amber-50"
          >
            <ArrowLeft className="size-4" />
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center justify-self-center transition hover:opacity-90"
          >
            <img
              src={`${import.meta.env.BASE_URL}images/logo.png`}
              alt="Perkaholics"
              className="w-24 sm:w-26"
            />
          </Link>
          <div aria-hidden="true" className="size-9 justify-self-end" />
        </div>
        <div className="mx-auto hidden max-w-6xl items-center justify-between px-4 py-3.5 sm:flex">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGoBack}
              aria-label="Go back"
              className="inline-flex size-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800 shadow-sm transition hover:border-amber-500/55 hover:bg-amber-50"
            >
              <ArrowLeft className="size-4" />
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center transition hover:opacity-90"
            >
              <img
                src={`${import.meta.env.BASE_URL}images/logo.png`}
                alt="Perkaholics"
                className="w-26"
              />
            </Link>
          </div>
          <nav className="w-full overflow-x-auto sm:w-auto">
            <div className="flex min-w-max items-center gap-2 text-sm font-medium">
              {user?.role === "employee" && (
                <>
                  <NavLink to="/employee/deals" className={desktopNavLinkClass}>
                    <BadgePercent className="size-3.5" />
                    Deals
                  </NavLink>
                  <NavLink to="/employee/redemptions" className={desktopNavLinkClass}>
                    <History className="size-3.5" />
                    My Redemptions
                  </NavLink>
                </>
              )}
              {user?.role === "corporate" && (
                <>
                  <NavLink to="/corporate/dashboard" className={desktopNavLinkClass}>
                    <LayoutDashboard className="size-3.5" />
                    <span>Dashboard</span>
                  </NavLink>
                  <NavLink to="/corporate/invitations" className={desktopNavLinkClass}>
                    <MailPlus className="size-3.5" />
                    <span>Invite Employees</span>
                  </NavLink>
                  <NavLink to="/corporate/employees" className={desktopNavLinkClass}>
                    <Users className="size-3.5" />
                    <span>Employees</span>
                  </NavLink>
                </>
              )}
              {user?.role === "merchant" && (
                <>
                  <NavLink to="/merchant/deals" className={desktopNavLinkClass}>
                    <Store className="size-3.5" />
                    My Deals
                  </NavLink>
                  <NavLink to="/merchant/dashboard" className={desktopNavLinkClass}>
                    <LayoutDashboard className="size-3.5" />
                    Dashboard
                  </NavLink>
                </>
              )}
              {user ? (
                <button
                  type="button"
                  className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-amber-500/55 hover:bg-amber-50 hover:text-slate-900"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-[--color-orange-03] to-[--color-orange-04] px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-[0_10px_28px_-16px_rgba(255,186,0,0.9)] transition hover:from-[--color-orange-02] hover:to-[--color-orange-04] sm:px-4"
                >
                  Log in
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:pb-6">
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </div>
      </main>
      {user ? (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/90 px-2 py-2 backdrop-blur-xl sm:hidden">
          <div
            className={`mx-auto grid max-w-6xl gap-1 ${
              user.role === "corporate" ? "grid-cols-5" : "grid-cols-4"
            }`}
          >
            {user.role === "corporate" && (
              <>
                <NavLink
                  to="/"
                  className={mobileTabClass}
                >
                  <House className="size-4" />
                  Home
                </NavLink>
                <NavLink
                  to="/corporate/dashboard"
                  className={mobileTabClass}
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </NavLink>
                <NavLink
                  to="/corporate/invitations"
                  className={mobileTabClass}
                >
                  <MailPlus className="size-4" />
                  Invite
                </NavLink>
                <NavLink
                  to="/corporate/employees"
                  className={mobileTabClass}
                >
                  <Users className="size-4" />
                  Employees
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={mobileTabClass}
                >
                  <Ticket className="size-4" />
                  Logout
                </button>
              </>
            )}
            {user.role === "employee" && (
              <>
                <NavLink
                  to="/"
                  className={mobileTabClass}
                >
                  <House className="size-4" />
                  Home
                </NavLink>
                <NavLink
                  to="/employee/deals"
                  className={mobileTabClass}
                >
                  <BadgePercent className="size-4" />
                  Deals
                </NavLink>
                <NavLink
                  to="/employee/redemptions"
                  className={mobileTabClass}
                >
                  <History className="size-4" />
                  History
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={mobileTabClass}
                >
                  <Ticket className="size-4" />
                  Logout
                </button>
              </>
            )}
            {user.role === "merchant" && (
              <>
                <NavLink
                  to="/"
                  className={mobileTabClass}
                >
                  <House className="size-4" />
                  Home
                </NavLink>
                <NavLink
                  to="/merchant/deals"
                  className={mobileTabClass}
                >
                  <Store className="size-4" />
                  Deals
                </NavLink>
                <NavLink
                  to="/merchant/dashboard"
                  className={mobileTabClass}
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={mobileTabClass}
                >
                  <Ticket className="size-4" />
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      ) : null}
      {user?.role === "employee" && user.uid ? (
        <EmployeeNavTutorial userId={user.uid} />
      ) : null}
    </div>
  );
} 
