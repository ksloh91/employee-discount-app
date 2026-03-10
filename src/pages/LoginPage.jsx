import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

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
    <div className="login-page">
      <h1>Log in</h1>
      <p className="login-subtitle">
        Choose a role to try the app (no real auth yet — demo only).
      </p>
      <div className="login-roles">
        {ROLES.map((role) => (
          <button
            key={role.id}
            type="button"
            className={`login-role-card ${selectedRole === role.id ? 'selected' : ''}`}
            onClick={() => setSelectedRole(role.id)}
          >
            <strong>{role.label}</strong>
            <span>{role.description}</span>
          </button>
        ))}
      </div>
      {selectedRole && (
        <button
          type="button"
          className="login-submit"
          onClick={() => handleLogin(selectedRole)}
        >
          Continue as {ROLES.find((r) => r.id === selectedRole)?.label}
        </button>
      )}
    </div>
  );
}
