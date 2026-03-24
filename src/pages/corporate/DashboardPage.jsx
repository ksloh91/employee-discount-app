import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
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
      } catch (error) {
        console.error("Error loading corporate dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

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
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Corporate dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Live program metrics from Firestore for employees, redemptions, and merchants.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium text-slate-400">Employees signed up</p>
          <p className="mt-2 text-2xl font-semibold text-secondary">
            {loading ? "—" : employeeCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium text-slate-400">Redemptions this month</p>
          <p className="mt-2 text-2xl font-semibold text-tertiary">
            {loading ? "—" : redemptionsThisMonth}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium text-slate-400">Participating merchants</p>
          <p className="mt-2 text-2xl font-semibold text-secondary">
            {loading ? "—" : merchantCount}
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium text-slate-400">Active employees</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">
            {loading ? "—" : activeEmployeeCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium text-slate-400">Suspended employees</p>
          <p className="mt-2 text-2xl font-semibold text-amber-300">
            {loading ? "—" : suspendedEmployeeCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium text-slate-400">Pending invitations</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">
            {loading ? "—" : pendingInviteCount}
          </p>
        </div>
      </div>
    </div>
  );
}
