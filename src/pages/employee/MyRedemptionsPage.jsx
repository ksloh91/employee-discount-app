import { useDeals } from '../../context/DealsContext';

export default function MyRedemptionsPage() {
  const { deals } = useDeals();
  const redeemedDeals = deals.filter((deal) => deal.redeemed);

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold text-slate-50">My redemptions</h1>
      <p className="text-sm text-slate-400">
        Your redemption history will appear here. Redeem deals from the Deals page to see them
        listed.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {redeemedDeals.length === 0 ? (
          <p className="text-sm text-slate-400 md:col-span-3">
            No redemptions yet. Browse the deals catalog and redeem an offer to see it here.
          </p>
        ) : (
          redeemedDeals.map((deal) => (
            <div
              key={deal.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <h3 className="text-sm font-semibold text-slate-100">{deal.title}</h3>
              <p className="mt-1 text-xs text-slate-400">{deal.merchantName}</p>
              <p className="mt-1 text-[0.7rem] text-slate-500">
                Valid until <span className="font-medium text-slate-300">{deal.validUntil}</span>
              </p>
              {deal.redeemedAt && (
                <p className="mt-1 text-[0.7rem] text-slate-500">
                  Redeemed on{' '}
                  <span className="font-medium text-slate-300">
                    {new Date(deal.redeemedAt).toLocaleString()}
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
