import { mockDeals } from '../../data/mockDeals';
import './MyDealsPage.css';

export default function MyDealsPage() {
  const merchantDeals = mockDeals.filter((d) => d.merchantName === 'Coffee Hub');

  return (
    <div className="merchant-deals-page">
      <h1>My deals</h1>
      <p>Create and manage your offers. (Only mock data for now.)</p>
      <div className="merchant-deals-list">
        {merchantDeals.length === 0 ? (
          <p>No deals yet. Add your first offer.</p>
        ) : (
          merchantDeals.map((deal) => (
            <div key={deal.id} className="merchant-deal-card">
              <h3>{deal.title}</h3>
              <p>{deal.description}</p>
              <p><strong>Code:</strong> {deal.code} · <strong>Valid until:</strong> {deal.validUntil}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
