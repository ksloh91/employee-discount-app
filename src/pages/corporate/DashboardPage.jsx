import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";

function isoToMs(value) {
  if (!value) return 0;
  if (typeof value === "object" && typeof value.toMillis === "function")
    return value.toMillis();
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [redemptions, setRedemptions] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [merchantCount, setMerchantCount] = useState(0);
  const [employeeEmails, setEmployeeEmails] = useState([]);
  const [invitationCounts, setInvitationCounts] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
  });
  const [pendingEmails, setPendingEmails] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const load = async () => {
      setLoading(true);
      try {
        const [redemptionsSnap, employeesSnap, merchantsSnap, invitationsSnap] =
          await Promise.all([
            getDocs(collection(db, "redemptions")),
            getDocs(
              query(
                collection(db, "users"),
                where("role", "==", "employee"),
              ),
            ),
            getDocs(
              query(
                collection(db, "users"),
                where("role", "==", "merchant"),
              ),
            ),
            getDocs(
              query(
                collection(db, "invitations"),
                where("createdBy", "==", user.uid),
              ),
            ),
          ]);

        const rows = redemptionsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        rows.sort((a, b) => isoToMs(b.redeemedAt) - isoToMs(a.redeemedAt));
        setRedemptions(rows);
        const employeeDocs = employeesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setEmployeeCount(employeeDocs.length);
        setEmployeeEmails(
          employeeDocs
            .map((e) => e.email || e.displayName || e.id)
            .filter(Boolean),
        );
        setMerchantCount(merchantsSnap.size);

        const invDocs = invitationsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const total = invDocs.length;
        const pendingList = invDocs.filter((i) => i.status === "pending");
        const pending = pendingList.length;
        const accepted = invDocs.filter((i) => i.status === "accepted").length;
        setInvitationCounts({ total, pending, accepted });
        setPendingEmails(pendingList.map((i) => i.email).filter(Boolean));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  const thisMonth = redemptions.filter(
    (r) =>
      new Date(isoToMs(r.redeemedAt)).getMonth() === new Date().getMonth() &&
      new Date(isoToMs(r.redeemedAt)).getFullYear() === new Date().getFullYear(),
  ).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">
          Corporate dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Program usage, unique employees redeeming, participating merchants, and
          invitation status.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium text-slate-400">
            Active Employees
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {loading ? "—" : employeeCount}
          </p>
          {!loading && employeeEmails.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-slate-700 pt-3">
              {employeeEmails.map((email) => (
                <li
                  key={email}
                  className="truncate text-xs text-slate-300"
                  title={email}
                >
                  {email}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium text-slate-400">
            Redemptions this month
          </p>
          <p className="mt-2 text-2xl font-semibold text-tertiary">
            {loading ? "—" : thisMonth}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium text-slate-400">
            Participating merchants
          </p>
          <p className="mt-2 text-2xl font-semibold text-secondary">
            {loading ? "—" : merchantCount}
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium text-slate-400">
            Invitations sent
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-50">
            {loading ? "—" : invitationCounts.total}
          </p>
        </div> */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium text-slate-400">
            Pending employee sign-ups
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-300">
            {loading ? "—" : invitationCounts.pending}
          </p>
          {!loading && pendingEmails.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-slate-700 pt-3">
              {pendingEmails.map((email) => (
                <li
                  key={email}
                  className="truncate text-xs text-slate-300"
                  title={email}
                >
                  {email}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
