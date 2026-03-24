import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    const fromState = location.state?.from?.pathname;
    const fallbackByRole =
      user.role === 'merchant'
        ? '/merchant/deals'
        : user.role === 'corporate'
        ? '/corporate/dashboard'
        : '/employee/deals';

    const target = fromState || fallbackByRole;
    navigate(target, { replace: true });
  }, [user, location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div className="space-y-1">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-slate-500">
            Welcome back
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Log in</h1>
          <p className="text-xs text-slate-500">
            Use an account created in Firebase Auth. See{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-[0.65rem]">docs/CORPORATE_LOGIN_SETUP.md</code>{" "}
            for corporate login, or <code className="rounded bg-slate-100 px-1 py-0.5 text-[0.65rem]">docs/MERCHANT_LOGIN_SETUP.md</code> for merchant.
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
              autoComplete="current-password"
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-primary/40 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}
