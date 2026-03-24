import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function formatDate(value) {
  if (!value) return "—";
  const t = value?.toMillis ? value.toMillis() : new Date(value).getTime();
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function InvitationsPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setError("Please enter an email address.");
      return;
    }
    setSubmitting(true);
    try {
      const alreadyPending = invitations.some(
        (i) => i.email === normalized && i.status === "pending",
      );
      if (alreadyPending) {
        setError("A pending invitation for this email already exists.");
        setSubmitting(false);
        return;
      }
      await addDoc(collection(db, "invitations"), {
        email: normalized,
        status: "pending",
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      setSuccess(
        `Invitation created for ${normalized}. Share the sign-up link with them: ${window.location.origin}/signup`,
      );
      setEmail("");
      setInvitations((prev) => [
        {
          id: "new",
          email: normalized,
          status: "pending",
          createdBy: user.uid,
          createdAt: { toMillis: () => Date.now() },
        },
        ...prev,
      ]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingInvitations = invitations.filter(
    (inv) => inv.status === "pending",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">
          Invite employees
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Pre-approve employees by email. Only invited addresses can sign up as
          employees.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-700 bg-slate-900/50 p-4"
      >
        <div className="min-w-[200px] flex-1 space-y-1">
          <label
            htmlFor="invite-email"
            className="text-xs font-medium text-slate-400"
          >
            Employee email
          </label>
          <Input
            id="invite-email"
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-full border-slate-600 bg-slate-800/80 text-slate-100 placeholder:text-slate-500"
            disabled={submitting}
          />
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-primary text-slate-950 hover:bg-amber-400"
        >
          {submitting ? "Sending…" : "Send invitation"}
        </Button>
      </form>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {success && (
        <p className="text-sm text-emerald-400">{success}</p>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200">
          Pending invitations
        </h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : pendingInvitations.length === 0 ? (
          <p className="text-sm text-slate-500">
            No pending invitations. Add an email above to invite an employee.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/50">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 font-medium text-slate-300">
                    Email
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-300">
                    Sent
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingInvitations.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-slate-800 last:border-0"
                  >
                    <td className="px-4 py-3 text-slate-100">{inv.email}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(inv.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-slate-500">
          Share the sign-up page with invited employees:{" "}
          <a
            href={`${typeof window !== "undefined" ? window.location?.origin : ""}/signup`}
            className="text-primary underline"
          >
            /signup
          </a>
        </p>
      </div>
    </div>
  );
}