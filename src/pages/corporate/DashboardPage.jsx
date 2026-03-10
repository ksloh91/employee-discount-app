export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Corporate dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Here you can see program usage, manage employees, and view subscription details.
          (Placeholder — to be built.)
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium text-slate-400">Active employees</p>
          <p className="mt-2 text-2xl font-semibold text-primary">132</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium text-slate-400">Redemptions this month</p>
          <p className="mt-2 text-2xl font-semibold text-tertiary">48</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs font-medium text-slate-400">Participating merchants</p>
          <p className="mt-2 text-2xl font-semibold text-secondary">12</p>
        </div>
      </div>
    </div>
  );
}
