import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeals } from "../../context/useDeals";

export default function EditDealPage() {
  const navigate = useNavigate();
  const { deals, updateDeal, deleteDeal } = useDeals();
  const { id } = useParams();
  const [deal, setDeal] = useState(() => deals.find((d) => d.id === id) ?? null);
  const handleChange = (e) => {
    setDeal({ ...deal, [e.target.name]: e.target.value });
  };
  const handleEditDeal = () => {
    if (!deal) return;
    updateDeal({
      ...deal,
      maxTotalRedemptions:
        deal.maxTotalRedemptions === "" || deal.maxTotalRedemptions == null
          ? null
          : Number(deal.maxTotalRedemptions),
      maxPerUserRedemptions:
        deal.maxPerUserRedemptions === "" || deal.maxPerUserRedemptions == null
          ? null
          : Number(deal.maxPerUserRedemptions),
    });
    navigate("/merchant/deals");
  };

  const handleDeleteDeal = () => {
    if (!deal) return;
    deleteDeal(deal.id);
    navigate("/merchant/deals");
  };
  return (
    <div>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Edit deal</h1>
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-slate-400">
            Title
          </label>
          <input type="text" id="title" name="title" value={deal?.title} onChange={handleChange} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary" />
        </div>
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-slate-400">
            Description
          </label>
          <input type="text" id="description" name="description" value={deal?.description} onChange={handleChange} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary" />
        </div>
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium text-slate-400">
            Code
          </label>
          <input type="text" id="code" name="code" value={deal?.code} onChange={handleChange} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <label htmlFor="validUntil" className="text-sm font-medium text-slate-400">
            Valid until
          </label>
          <input type="date" id="validUntil" name="validUntil" value={deal?.validUntil} onChange={handleChange} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary" />
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="maxTotalRedemptions" className="text-sm font-medium text-slate-400">
            Max total redemptions (optional)
          </label>
          <input
            type="number"
            min="1"
            id="maxTotalRedemptions"
            name="maxTotalRedemptions"
            value={deal?.maxTotalRedemptions ?? ""}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary"
            placeholder="e.g. 100"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="maxPerUserRedemptions" className="text-sm font-medium text-slate-400">
            Max per user
          </label>
          <input
            type="number"
            min="1"
            id="maxPerUserRedemptions"
            name="maxPerUserRedemptions"
            value={deal?.maxPerUserRedemptions ?? ""}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary"
          />
        </div>
      </div>
      <button className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-orange-03 px-4 py-2 text-xs font-semibold text-black shadow hover:bg-[--color-orange-05]"
      onClick={handleEditDeal}
      >
        Update
      </button>
      <button className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-delete-05 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-[--color-delete-04]"
      onClick={handleDeleteDeal}
      >
        Delete deal
      </button>
    </div>
  );
}