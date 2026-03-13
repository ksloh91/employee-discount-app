import { useNavigate } from 'react-router-dom';
import { useDeals } from '../../context/DealsContext';

export default function MyDealsPage() {
  const navigate = useNavigate();
  const { deals } = useDeals();
  const merchantDeals = deals.filter((d) => d.merchantName === 'Coffee Hub');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">My deals</h1>
        <p className="mt-1 text-sm text-slate-400">
          Create and manage your offers. (Only mock data for now.)
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {merchantDeals.length === 0 ? (
          <p className="text-sm text-slate-400">No deals yet. Add your first offer.</p>
        ) : (
          merchantDeals.map((deal) => (
            <div
              key={deal.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <h3 className="text-sm font-semibold text-slate-100">{deal.title}</h3>
              <p className="mt-1 text-xs text-slate-300">{deal.description}</p>
              <p className="mt-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-200">Code:</span>{' '}
                <span className="font-mono text-xs text-primary">{deal.code}</span>{' '}
                <span className="font-semibold text-slate-200"> · Valid until:</span>{' '}
                <span className="text-slate-200">{deal.validUntil}</span>
              </p>

              <div className="flex">
                <div className="flex-1" />
                <button 
                  className="mt-4 w-[100px] items-center justify-center rounded-full bg-orange-03 px-4 py-2 text-xs font-semibold text-black shadow hover:bg-[--color-orange-05]"
                  onClick={() => navigate(`/merchant/edit-deal/${deal.id}`)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div>
        <button 
        className="inline-flex w-full items-center justify-center rounded-full bg-orange-03 px-4 py-2 text-xs font-semibold text-black shadow hover:bg-[--color-orange-05]"
        onClick={() => navigate('/merchant/add-deal')}
        >
          Add new deal
        </button>
      </div>
    </div>
  );
}
