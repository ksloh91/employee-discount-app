import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignUpPage() {
  const { user, registerWithInvitation } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    if (user.role === "employee") navigate("/employee/deals", { replace: true });
    else if (user.role === "merchant") navigate("/merchant/deals", { replace: true });
    else if (user.role === "corporate") navigate("/corporate/dashboard", { replace: true });
    else navigate("/", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await registerWithInvitation(email, password);
      navigate("/employee/deals", { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        err?.code === "no-invitation"
          ? err.message
          : "Sign-up failed. Ensure your email was invited.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div className="space-y-1">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-slate-500">
            Employee sign-up
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="text-xs text-slate-500">
            You must use an email that your employer has invited.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-medium text-slate-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-medium text-slate-600">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-xs font-medium text-slate-600">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-primary/40 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
