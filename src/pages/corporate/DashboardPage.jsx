import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../../lib/firebase";

function isoToMs(value) {
  if (!value) return 0;
  if (typeof value === "object" && typeof value.toMillis === "function") {
    return value.toMillis();
  }
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [activeEmployeeCount, setActiveEmployeeCount] = useState(0);
  const [suspendedEmployeeCount, setSuspendedEmployeeCount] = useState(0);
  const [pendingInviteCount, setPendingInviteCount] = useState(0);
  const [merchantCount, setMerchantCount] = useState(0);
  const [redemptions, setRedemptions] = useState([]);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [employeesSnap, merchantsSnap, redemptionsSnap, invitationsSnap] = await Promise.all([
        getDocs(query(collection(db, "users"), where("role", "==", "employee"))),
        getDocs(query(collection(db, "users"), where("role", "==", "merchant"))),
        getDocs(collection(db, "redemptions")),
        getDocs(query(collection(db, "invitations"), where("status", "==", "pending"))),
      ]);

      const employees = employeesSnap.docs.map((d) => d.data());
      const suspended = employees.filter((e) => e.status === "suspended").length;
      const active = employees.length - suspended;
      setEmployeeCount(employees.length);
      setActiveEmployeeCount(active);
      setSuspendedEmployeeCount(suspended);
      setPendingInviteCount(invitationsSnap.size);
      setMerchantCount(merchantsSnap.size);
      setRedemptions(redemptionsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLastUpdatedAt(Date.now());
    } catch (e) {
      console.error("Error loading corporate dashboard stats:", e);
      setError("Failed to load dashboard data. Please retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const redemptionsThisMonth = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return redemptions.filter((r) => {
      const ts = isoToMs(r.redeemedAt);
      if (!ts) return false;
      const dt = new Date(ts);
      return dt.getMonth() === month && dt.getFullYear() === year;
    }).length;
  }, [redemptions]);

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-white/10 bg-slate-900/55 p-5 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-amber-300/85">
          Program overview
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Corporate dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Live program metrics from Firestore for employees, redemptions, and merchants.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>
            Last updated: {lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleString() : "—"}
          </span>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-slate-200 transition hover:border-amber-300/60 hover:bg-amber-300/10 hover:text-amber-200 disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>
      {error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-950/30 p-3 text-sm text-red-200">
          <p>{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-2 rounded-full border border-red-300/40 px-3 py-1 text-xs font-semibold text-red-100 hover:bg-red-900/40"
          >
            Retry
          </button>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-900/65 p-4 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
          <p className="text-xs font-medium text-slate-400">Employees signed up</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-indigo-200">
            {loading ? (
              <span className="inline-block h-9 w-16 rounded bg-white/10 animate-pulse align-middle" />
            ) : (
              employeeCount
            )}
          </p>
          <Link
            to="/corporate/employees"
            className="mt-3 inline-block text-xs text-amber-300 transition hover:text-amber-200 hover:underline"
          >
            View details
          </Link>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900/65 p-4 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
          <p className="text-xs font-medium text-slate-400">Redemptions this month</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-emerald-300">
            {loading ? (
              <span className="inline-block h-9 w-16 rounded bg-white/10 animate-pulse align-middle" />
            ) : (
              redemptionsThisMonth
            )}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900/65 p-4 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
          <p className="text-xs font-medium text-slate-400">Participating merchants</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-violet-200">
            {loading ? (
              <span className="inline-block h-9 w-16 rounded bg-white/10 animate-pulse align-middle" />
            ) : (
              merchantCount
            )}
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-900/65 p-4 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
          <p className="text-xs font-medium text-slate-400">Active employees</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-emerald-300">
            {loading ? (
              <span className="inline-block h-9 w-16 rounded bg-white/10 animate-pulse align-middle" />
            ) : (
              activeEmployeeCount
            )}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900/65 p-4 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
          <p className="text-xs font-medium text-slate-400">Suspended employees</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-amber-300">
            {loading ? (
              <span className="inline-block h-9 w-16 rounded bg-white/10 animate-pulse align-middle" />
            ) : (
              suspendedEmployeeCount
            )}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900/65 p-4 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
          <p className="text-xs font-medium text-slate-400">Pending invitations</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">
            {loading ? (
              <span className="inline-block h-9 w-16 rounded bg-white/10 animate-pulse align-middle" />
            ) : (
              pendingInviteCount
            )}
          </p>
          <Link
            to="/corporate/invitations"
            className="mt-3 inline-block text-xs text-amber-300 transition hover:text-amber-200 hover:underline"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}
