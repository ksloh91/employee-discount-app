import { useState } from 'react';
import { mockDeals } from '../../data/mockDeals';
import './DealsPage.css';

export default function DealsPage() {
  const [redeemed, setRedeemed] = useState(new Set());

  const handleRedeem = (id) => {
    setRedeemed((prev) => new Set(prev).add(id));
  };

  return (
    <div className="deals-page">
      <h1>Available deals</h1>
      <p className="deals-intro">
        Redeem these offers at participating merchants. Show the code or mention the offer
        at checkout.
      </p>
      <div className="deals-grid">
        {mockDeals.map((deal) => (
          <article key={deal.id} className="deal-card">
            <span className="deal-category">{deal.category}</span>
            <h2>{deal.title}</h2>
            <p className="deal-merchant">{deal.merchantName}</p>
            <p className="deal-desc">{deal.description}</p>
            <div className="deal-meta">
              <strong>{deal.discount}</strong>
              {deal.code && <code>{deal.code}</code>}
              <span>Valid until {deal.validUntil}</span>
            </div>
            {redeemed.has(deal.id) ? (
              <div className="deal-redeemed">Redeemed</div>
            ) : (
              <button
                type="button"
                className="deal-btn"
                onClick={() => handleRedeem(deal.id)}
              >
                Redeem offer
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
