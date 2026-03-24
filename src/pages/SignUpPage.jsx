import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const { user, registerWithInvitation } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.role === "employee") {
      navigate("/employee/deals", { replace: true });
      return;
    }
    if (user.role === "merchant") navigate("/merchant/deals", { replace: true });
    else if (user.role === "corporate")
      navigate("/corporate/dashboard", { replace: true });
    else navigate("/", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please enter email and password.");
      return;
    }
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
      await registerWithInvitation(trimmedEmail, password);
      // Auth state will update; useEffect above redirects when user.role === 'employee'
    } catch (err) {
      console.error(err);
      setError(
        err.code === "no-invitation"
          ? err.message
          : err.message || "Sign-up failed. Try again or contact your employer.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div className="space-y-1">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-slate-500">
            Employee sign-up
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="text-xs text-slate-500">
            You can only sign up if your employer has sent you an invitation. Use
            the email address that received the invite.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="signup-email"
              className="text-xs font-medium text-slate-600"
            >
              Email (invited address)
            </label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border-slate-200 bg-slate-50 text-slate-900"
              required
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="signup-password"
              className="text-xs font-medium text-slate-600"
            >
              Password
            </label>
            <Input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full border-slate-200 bg-slate-50 text-slate-900"
              required
              minLength={6}
            />
            <p className="text-[0.65rem] text-slate-500">
              At least 6 characters
            </p>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="signup-confirm"
              className="text-xs font-medium text-slate-600"
            >
              Confirm password
            </label>
            <Input
              id="signup-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-full border-slate-200 bg-slate-50 text-slate-900"
              required
            />
          </div>
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-slate-950 shadow-lg hover:bg-amber-400"
          >
            {submitting ? "Creating account…" : "Create account"}
          </Button>
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
