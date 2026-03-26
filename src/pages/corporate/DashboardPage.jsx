import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
  const [rangeDays, setRangeDays] = useState(30);
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
      // 1) Data fetch layer: load all raw datasets in parallel.
      const [employeesSnap, merchantsSnap, redemptionsSnap, invitationsSnap] = await Promise.all([
        getDocs(query(collection(db, "users"), where("role", "==", "employee"))),
        getDocs(query(collection(db, "users"), where("role", "==", "merchant"))),
        getDocs(collection(db, "redemptions")),
        getDocs(query(collection(db, "invitations"), where("status", "==", "pending"))),
      ]);

      const employees = employeesSnap.docs.map((d) => d.data());
      const suspended = employees.filter((e) => e.status === "suspended").length;
      const active = employees.length - suspended;
      // Store summary metrics for direct KPI cards.
      setEmployeeCount(employees.length);
      setActiveEmployeeCount(active);
      setSuspendedEmployeeCount(suspended);
      setPendingInviteCount(invitationsSnap.size);
      setMerchantCount(merchantsSnap.size);
      // Keep full redemptions list; we'll derive chart + top lists from it.
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
    // 2) Transformation layer: derive this month's count from raw redemptions.
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

  const chartData = useMemo(() => {
    // Build a complete day-by-day series so zero-count days still render on chart.
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(today);
    start.setDate(today.getDate() - (rangeDays - 1));
    const startMs = start.getTime();

    const byDay = new Map();
    for (let i = 0; i < rangeDays; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, {
        key,
        label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        count: 0,
      });
    }

    redemptions.forEach((r) => {
      // Bucket each redemption into its date key.
      const ts = isoToMs(r.redeemedAt);
      if (!ts || ts < startMs) return;
      const key = new Date(ts).toISOString().slice(0, 10);
      const row = byDay.get(key);
      if (row) row.count += 1;
    });

    return Array.from(byDay.values());
  }, [rangeDays, redemptions]);

  const topDeals = useMemo(() => {
    // Aggregate + rank deal IDs by redemption volume (top 5).
    const counts = new Map();
    redemptions.forEach((r) => {
      const id = r.dealId || "unknown";
      counts.set(id, (counts.get(id) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [redemptions]);

  const topMerchants = useMemo(() => {
    // Aggregate + rank merchant IDs by redemption volume (top 5).
    const counts = new Map();
    redemptions.forEach((r) => {
      const id = r.merchantId || "unknown";
      counts.set(id, (counts.get(id) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
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
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-900/65 p-4 shadow-[var(--app-shadow-lg)] backdrop-blur-xl lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-white">Redemptions trend</p>
              <p className="text-xs text-slate-400">
                Daily redemptions for the selected period.
              </p>
            </div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-xs">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setRangeDays(days)}
                  className={`rounded-full px-3 py-1 font-semibold transition ${
                    rangeDays === days
                      ? "bg-amber-300/20 text-amber-200"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 rounded-2xl border border-white/10 bg-slate-950/45 p-2">
            {loading ? (
              <div className="h-full animate-pulse rounded-xl bg-white/5" />
            ) : (
              // 3) Rendering layer: chart consumes transformed `chartData`.
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ stroke: "rgba(255,186,0,0.35)", strokeWidth: 1 }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      backgroundColor: "rgba(2,6,23,0.92)",
                      color: "#e2e8f0",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [`${value}`, "Redemptions"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#ffba00"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: "#ffba00", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-slate-900/65 p-4 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
            <p className="text-sm font-semibold text-white">Top deals</p>
            <p className="mb-2 text-xs text-slate-400">Most redeemed deal IDs</p>
            <ul className="space-y-2 text-xs">
              {topDeals.length === 0 ? (
                <li className="text-slate-500">No redemptions yet.</li>
              ) : (
                // Render derived rankings from `topDeals`.
                topDeals.map((d) => (
                  <li key={d.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                    <span className="truncate text-slate-200">{d.id}</span>
                    <span className="font-semibold text-amber-200">{d.count}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/65 p-4 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
            <p className="text-sm font-semibold text-white">Top merchants</p>
            <p className="mb-2 text-xs text-slate-400">Most redeemed merchant IDs</p>
            <ul className="space-y-2 text-xs">
              {topMerchants.length === 0 ? (
                <li className="text-slate-500">No redemptions yet.</li>
              ) : (
                // Render derived rankings from `topMerchants`.
                topMerchants.map((m) => (
                  <li key={m.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                    <span className="truncate text-slate-200">{m.id}</span>
                    <span className="font-semibold text-emerald-200">{m.count}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
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
