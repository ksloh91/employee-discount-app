import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-100 via-sky-50 to-slate-50 px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl text-center text-primary">
          <span className="inline-flex items-center rounded-full border border-white/60 bg-white/80 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.25em] text-slate-500 shadow-sm">
            Employee benefit platform
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Employee Discount Program
          </h1>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Exclusive deals and discounts from participating merchants — for employees of
            subscribed companies.
          </p>
          {!user ? (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 hover:border-primary hover:text-primary"
              >
                Employee sign up
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3 text-sm text-slate-700">
              <p>Welcome back. Use the menu above to browse deals or manage your account.</p>
              {user.role === 'employee' && (
                <div>
                  <Link
                    to="/employee/deals"
                    className="inline-flex items-center rounded-full border border-slate-300 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-800 hover:border-primary hover:text-primary"
                  >
                    Browse deals
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">Who uses this?</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white">Employees</h3>
            <p className="mt-1 text-xs text-slate-400">
              Browse and redeem exclusive discounts from partner merchants.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white">Corporates</h3>
            <p className="mt-1 text-xs text-slate-400">
              Subscribe to offer the program as a benefit to your workforce.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white">Merchants</h3>
            <p className="mt-1 text-xs text-slate-400">
              Reach engaged employees with targeted offers and grow your customer base.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
