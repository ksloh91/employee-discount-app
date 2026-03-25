import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EmployeeNavTutorial from "./EmployeeNavTutorial";
import {
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
      ? "border-amber-300/70 bg-amber-300/10 text-amber-200 shadow-[0_10px_25px_-16px_rgba(255,186,0,0.8)]"
      : "border-transparent text-slate-300 hover:border-white/15 hover:bg-white/7 hover:text-white"
  }`;

const mobileTabClass =
  "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-slate-200 transition-transform duration-200 active:scale-95";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[radial-gradient(circle_at_12%_20%,rgba(255,186,0,0.2),transparent_35%),radial-gradient(circle_at_88%_0%,rgba(99,102,241,0.28),transparent_38%),linear-gradient(180deg,#020617_0%,#0b1120_48%,#020617_100%)] text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/65 shadow-[0_20px_40px_-28px_rgba(2,6,23,0.95)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3.5">
          <div className="flex flex-col items-start gap-0">
            <Link
              to="/"
              className="text-lg font-semibold tracking-tight text-white transition hover:opacity-90"
            >
              <img src="/images/logo.png" alt="logo" className="w-24 sm:w-26" />
              {/* Perkaholics Employee Discounts */}
            </Link>

            {user && (
              <div className="max-w-[180px] truncate text-xs text-slate-400 sm:max-w-none sm:text-sm">
                Logged in as {user.displayName}
              </div>
            )}
          </div>
          <nav className="hidden w-full overflow-x-auto sm:block sm:w-auto">
            <div className="flex min-w-max items-center gap-1 text-xs font-medium sm:gap-2 sm:text-sm">
            {user?.role === "employee" && (
              <>
                <NavLink
                  to="/employee/deals"
                  className={desktopNavLinkClass}
                >
                  <BadgePercent className="size-3.5" />
                  Deals
                </NavLink>
                <NavLink
                  to="/employee/redemptions"
                  className={desktopNavLinkClass}
                >
                  <History className="size-3.5" />
                  My Redemptions
                </NavLink>
              </>
            )}
            {user?.role === "corporate" && (
              <>
                <NavLink
                  to="/corporate/dashboard"
                  className={desktopNavLinkClass}
                >
                  <LayoutDashboard className="size-3.5" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/corporate/invitations"
                  className={desktopNavLinkClass}
                >
                  <MailPlus className="size-3.5" />
                  <span>Invite Employees</span>
                </NavLink>
                <NavLink
                  to="/corporate/employees"
                  className={desktopNavLinkClass}
                >
                  <Users className="size-3.5" />
                  <span>Employees</span>
                </NavLink>
              </>
            )}
            {user?.role === "merchant" && (
              <>
                <NavLink
                  to="/merchant/deals"
                  className={desktopNavLinkClass}
                >
                  <Store className="size-3.5" />
                  My Deals
                </NavLink>
                <NavLink
                  to="/merchant/dashboard"
                  className={desktopNavLinkClass}
                >
                  <LayoutDashboard className="size-3.5" />
                  Dashboard
                </NavLink>
              </>
            )}
            {user ? (
              <button
                type="button"
                className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:border-amber-300/55 hover:bg-amber-300/10 hover:text-amber-200"
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
          {user ? (
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-100 transition hover:border-amber-300/55 hover:bg-amber-300/10 sm:hidden"
              onClick={handleLogout}
            >
              Log out
            </button>
          ) : null}
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:pb-6">
          <Outlet />
        </div>
      </main>
      {user ? (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/90 px-2 py-2 backdrop-blur-xl sm:hidden">
          <div className="mx-auto grid max-w-6xl grid-cols-4 gap-1">
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
