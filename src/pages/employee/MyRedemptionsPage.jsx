import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useDeals } from '../../context/useDeals';
import { useAuth } from '../../context/useAuth';

export default function MyRedemptionsPage() {
  const { deals } = useDeals();
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const q = query(
        collection(db, 'redemptions'),
        where('userId', '==', user.uid),
      );
      const snap = await getDocs(q);
      const byDeal = new Map(deals.map((d) => [d.id, d]));
      const result = snap.docs
        .map((doc) => {
          const data = doc.data();
          const deal = byDeal.get(data.dealId);
          if (!deal) return null;
          return {
            id: doc.id,
            deal,
            redeemedAt: data.redeemedAt,
          };
        })
        .filter(Boolean);
      setItems(result);
    };
    load();
  }, [user, deals]);

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-slate-50">My redemptions</h1>
      <p className="text-sm text-slate-400">
        Your redemption history will appear here. Redeem deals from the Deals page to see them
        listed.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400 md:col-span-3">
            No redemptions yet. Browse the deals catalog and redeem an offer to see it here.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <h3 className="text-sm font-semibold text-slate-100">{item.deal.title}</h3>
              <p className="mt-1 text-xs text-slate-400">{item.deal.merchantName}</p>
              <p className="mt-1 text-[0.7rem] text-slate-500">
                Valid until{' '}
                <span className="font-medium text-slate-300">{item.deal.validUntil}</span>
              </p>
              {item.redeemedAt && (
                <p className="mt-1 text-[0.7rem] text-slate-500">
                  Redeemed on{' '}
                  <span className="font-medium text-slate-300">
                    {new Date(item.redeemedAt).toLocaleString()}
                  </span>
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
