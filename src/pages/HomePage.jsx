import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home">
      <section className="home-hero">
        <h1>Employee Discount Program</h1>
        <p>
          Exclusive deals and discounts from participating merchants — for employees of
          subscribed companies.
        </p>
        {!user ? (
          <Link to="/login" className="home-cta">
            Log in to view deals
          </Link>
        ) : (
          <div className="home-welcome">
            <p>Welcome back. Use the menu above to browse deals or manage your account.</p>
            {user.role === 'employee' && (
              <Link to="/employee/deals" className="home-cta">
                Browse deals
              </Link>
            )}
          </div>
        )}
      </section>
      <section className="home-roles">
        <h2>Who uses this?</h2>
        <div className="home-cards">
          <div className="home-card">
            <h3>Employees</h3>
            <p>Browse and redeem exclusive discounts from partner merchants.</p>
          </div>
          <div className="home-card">
            <h3>Corporates</h3>
            <p>Subscribe to offer the program as a benefit to your workforce.</p>
          </div>
          <div className="home-card">
            <h3>Merchants</h3>
            <p>Reach engaged employees with targeted offers and grow your customer base.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
