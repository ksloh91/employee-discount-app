import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  doc,
} from "firebase/firestore";
import {
  CheckCircle2,
  Clock3,
  MailPlus,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import Skeleton from "../../components/Skeleton";

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
  const [actioningId, setActioningId] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
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

  const invitationCounts = useMemo(() => {
    const pending = invitations.filter((inv) => inv.status === "pending").length;
    const accepted = invitations.filter((inv) => inv.status === "accepted").length;
    const revoked = invitations.filter((inv) => inv.status === "revoked").length;
    return { pending, accepted, revoked };
  }, [invitations]);

  const visibleInvitations = useMemo(() => {
    if (activeTab === "all") return invitations;
    return invitations.filter((inv) => inv.status === activeTab);
  }, [activeTab, invitations]);

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

  const handleRevoke = async (invitation) => {
    setError("");
    setSuccess("");
    setActioningId(invitation.id);
    try {
      await updateDoc(doc(db, "invitations", invitation.id), {
        status: "revoked",
        revokedAt: serverTimestamp(),
      });
      setInvitations((current) =>
        current.map((row) =>
          row.id === invitation.id
            ? {
                ...row,
                status: "revoked",
                revokedAt: { toMillis: () => Date.now() },
              }
            : row,
        ),
      );
      setSuccess(`Invitation revoked for ${invitation.email}.`);
    } catch (e) {
      console.error("Error revoking invitation:", e);
      setError("Failed to revoke invitation.");
    } finally {
      setActioningId("");
    }
  };

  const handleResend = async (invitation) => {
    setError("");
    setSuccess("");
    setActioningId(invitation.id);
    try {
      await updateDoc(doc(db, "invitations", invitation.id), {
        status: "pending",
        createdAt: serverTimestamp(),
        resentAt: serverTimestamp(),
      });
      setInvitations((current) =>
        current
          .map((row) =>
            row.id === invitation.id
              ? {
                  ...row,
                  status: "pending",
                  createdAt: { toMillis: () => Date.now() },
                  resentAt: { toMillis: () => Date.now() },
                }
              : row,
          )
          .sort(
            (a, b) =>
              (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) -
              (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0),
          ),
      );
      setSuccess(`Invitation re-sent for ${invitation.email}.`);
    } catch (e) {
      console.error("Error re-sending invitation:", e);
      setError("Failed to re-send invitation.");
    } finally {
      setActioningId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-900/55 p-5 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-amber-300/85">
          Access control
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Invite employees
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Only invited addresses can sign up as employees.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-stretch gap-3 rounded-3xl border border-white/10 bg-slate-900/65 p-4 shadow-[var(--app-shadow-lg)] backdrop-blur-xl sm:flex-row sm:items-end"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <label htmlFor="invite-email" className="text-xs font-medium text-slate-400">
            Employee email
          </label>
          <input
            id="invite-email"
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full rounded-full border border-white/15 bg-slate-800/70 px-4 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 transition focus:border-amber-300/75"
            disabled={submitting}
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[--color-orange-03] to-[--color-orange-04] px-5 text-sm font-semibold text-white shadow-[0_12px_30px_-16px_rgba(255,186,0,0.95)] transition hover:from-[--color-orange-02] hover:to-[--color-orange-04] disabled:opacity-60 sm:w-auto"
        >
          <MailPlus className="size-4" />
          <span>{submitting ? "Sending..." : "Send"}</span>
        </button>
      </form>

      {error ? (
        <p className="rounded-xl border border-red-500/35 bg-red-950/25 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-300">
          {success}
        </p>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200">Invitations</h2>
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              activeTab === "pending"
                ? "border border-amber-300/65 bg-amber-300/12 text-amber-200"
                : "border border-white/15 text-slate-300 hover:border-white/30 hover:bg-white/5"
            }`}
          >
            <Clock3 className="size-3.5" />
            <span>Pending ({invitationCounts.pending})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("accepted")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              activeTab === "accepted"
                ? "border border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                : "border border-white/15 text-slate-300 hover:border-white/30 hover:bg-white/5"
            }`}
          >
            <CheckCircle2 className="size-3.5" />
            <span>Accepted ({invitationCounts.accepted})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("revoked")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              activeTab === "revoked"
                ? "border border-rose-400/60 bg-rose-400/10 text-rose-300"
                : "border border-white/15 text-slate-300 hover:border-white/30 hover:bg-white/5"
            }`}
          >
            <XCircle className="size-3.5" />
            <span>Revoked ({invitationCounts.revoked})</span>
          </button>
        </div>
        {loading ? (
          <div className="space-y-2">
            <div className="space-y-2 md:hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={i}
                  className="rounded-2xl border border-white/10 bg-slate-900/65 p-3 shadow-[var(--app-shadow-lg)] backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="mt-2 h-3 w-28" />
                  <div className="mt-3 flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-slate-900/65 shadow-[var(--app-shadow-lg)] backdrop-blur-xl md:block">
              <div className="grid grid-cols-4 gap-2 px-4 py-3 text-xs text-slate-500">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="divide-y divide-white/5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 px-4 py-3">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : visibleInvitations.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-center shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
            <p className="text-sm font-semibold text-white">
              No invitations in this tab
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Try switching to another status (Pending, Accepted, Revoked).
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 md:hidden">
              {visibleInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/65 p-3 shadow-[var(--app-shadow-lg)] backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-100">{inv.email}</p>
                    <span
                      className={
                        inv.status === "accepted"
                          ? "inline-flex items-center gap-1 text-xs text-emerald-400"
                          : inv.status === "revoked"
                          ? "inline-flex items-center gap-1 text-xs text-rose-300"
                          : "inline-flex items-center gap-1 text-xs text-amber-300"
                      }
                    >
                      {inv.status === "accepted" ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : inv.status === "revoked" ? (
                        <XCircle className="size-3.5" />
                      ) : (
                        <Clock3 className="size-3.5" />
                      )}
                      {inv.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(inv.createdAt)}</p>
                  <div className="mt-3 flex gap-2">
                    {inv.status === "pending" ? (
                      <button
                        type="button"
                        disabled={actioningId === inv.id}
                        onClick={() => handleRevoke(inv)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:border-rose-400 hover:bg-rose-400/10 hover:text-rose-300 disabled:opacity-50"
                      >
                        <XCircle className="size-3.5" />
                        Revoke
                      </button>
                    ) : null}
                    {inv.status === "revoked" ? (
                      <button
                        type="button"
                        disabled={actioningId === inv.id}
                        onClick={() => handleResend(inv)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:border-amber-300/70 hover:bg-amber-300/10 hover:text-amber-200 disabled:opacity-50"
                      >
                        <RotateCcw className="size-3.5" />
                        Re-send
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-slate-900/65 shadow-[var(--app-shadow-lg)] backdrop-blur-xl md:block">
              <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 font-medium text-slate-300">Email</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Sent</th>
                  <th className="px-4 py-3 font-medium text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleInvitations.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 text-slate-100">{inv.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          inv.status === "accepted"
                            ? "text-emerald-400"
                            : inv.status === "revoked"
                            ? "text-rose-300"
                            : "text-amber-300"
                        }
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(inv.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {inv.status === "pending" ? (
                          <button
                            type="button"
                            disabled={actioningId === inv.id}
                            onClick={() => handleRevoke(inv)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:border-rose-400 hover:bg-rose-400/10 hover:text-rose-300 disabled:opacity-50"
                          >
                            <XCircle className="size-3.5" />
                            Revoke
                          </button>
                        ) : null}
                        {inv.status === "revoked" ? (
                          <button
                            type="button"
                            disabled={actioningId === inv.id}
                            onClick={() => handleResend(inv)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:border-amber-300/70 hover:bg-amber-300/10 hover:text-amber-200 disabled:opacity-50"
                          >
                            <Send className="size-3.5" />
                            Re-send
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
