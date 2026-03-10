import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <Link to="/" className="layout-brand">
          Employee Discounts
        </Link>
        <nav className="layout-nav">
          {user?.role === 'employee' && (
            <>
              <Link to="/employee/deals">Deals</Link>
              <Link to="/employee/redemptions">My Redemptions</Link>
            </>
          )}
          {user?.role === 'corporate' && (
            <Link to="/corporate/dashboard">Dashboard</Link>
          )}
          {user?.role === 'merchant' && (
            <Link to="/merchant/deals">My Deals</Link>
          )}
          {user ? (
            <button type="button" className="layout-logout" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <Link to="/login">Log in</Link>
          )}
        </nav>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
