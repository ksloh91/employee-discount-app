import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id: 'employee', label: 'Employee', description: 'Browse and redeem deals' },
  { id: 'corporate', label: 'Corporate admin', description: 'Manage company and usage' },
  { id: 'merchant', label: 'Merchant', description: 'Create and manage your deals' },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = (role) => {
    login(role, { name: `Demo ${role}` });
    navigate(from, { replace: true });
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
            Choose a role to try the app (no real auth yet — demo only).
          </p>
        </div>
        <div className="grid gap-3">
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                className={`flex flex-col items-start rounded-2xl border px-4 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 ${
                  isSelected
                    ? 'border-primary/80 bg-primary text-slate-950 shadow-md'
                    : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 hover:bg-white'
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <span className="font-medium">{role.label}</span>
                <span
                  className={`mt-0.5 text-[0.7rem] ${
                    isSelected ? 'text-slate-900/80' : 'text-slate-500'
                  }`}
                >
                  {role.description}
                </span>
              </button>
            );
          })}
        </div>
        {selectedRole && (
          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-primary/40 hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
            onClick={() => handleLogin(selectedRole)}
          >
            Continue as {ROLES.find((r) => r.id === selectedRole)?.label}
          </button>
        )}
      </div>
    </div>
  );
}
