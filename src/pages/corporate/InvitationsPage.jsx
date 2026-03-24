import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";

function formatDate(value) {
  if (!value) return "—";
  const millis = value?.toMillis ? value.toMillis() : new Date(value).getTime();
  if (!Number.isFinite(millis)) return "—";
  return new Date(millis).toLocaleString();
}

export default function InvitationsPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const load = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "invitations"),
          where("createdBy", "==", user.uid),
        );
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        rows.sort(
          (a, b) =>
            (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) -
            (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0),
        );
        setInvitations(rows);
      } catch (e) {
        console.error("Error loading invitations:", e);
        setError("Failed to load invitations.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  const pendingInvitations = useMemo(
    () => invitations.filter((inv) => inv.status === "pending"),
    [invitations],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setError("Please enter an email address.");
      return;
    }

    const alreadyPending = invitations.some(
      (inv) => inv.email === normalized && inv.status === "pending",
    );
    if (alreadyPending) {
      setError("A pending invitation for this email already exists.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "invitations"), {
        email: normalized,
        status: "pending",
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      setInvitations((prev) => [
        {
          id: `local-${Date.now()}`,
          email: normalized,
          status: "pending",
          createdBy: user.uid,
          createdAt: { toMillis: () => Date.now() },
        },
        ...prev,
      ]);
      setSuccess(`Invitation created for ${normalized}.`);
      setEmail("");
    } catch (e) {
      console.error("Error creating invitation:", e);
      setError("Failed to create invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Invite employees</h1>
        <p className="mt-1 text-sm text-slate-400">
          Only invited addresses can sign up as employees.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-700 bg-slate-900/50 p-4"
      >
        <div className="min-w-[200px] flex-1 space-y-1">
          <label htmlFor="invite-email" className="text-xs font-medium text-slate-400">
            Employee email
          </label>
          <input
            id="invite-email"
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full rounded-full border border-slate-600 bg-slate-800/80 px-4 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-primary"
            disabled={submitting}
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send invitation"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-400">{success}</p> : null}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200">Pending invitations</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : pendingInvitations.length === 0 ? (
          <p className="text-sm text-slate-500">
            No pending invitations. Add an email above to invite an employee.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/50">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 font-medium text-slate-300">Email</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Sent</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvitations.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-800 last:border-0">
                    <td className="px-4 py-3 text-slate-100">{inv.email}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(inv.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
