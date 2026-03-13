import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeals } from "../../context/DealsContext";

export default function AddDealsPage() {
  const navigate = useNavigate();
  const { addDeal } = useDeals();
  const [deal, setDeal] = useState({
    title: "",
    description: "",
    code: "",
    validUntil: "",
    category: "",
    merchant: "",
    terms: "",
    image: "",
  });

  const handleChange = (e) => {
    setDeal({ ...deal, [e.target.name]: e.target.value });
  };
  const handleAddDeal = () => {
    addDeal({ ...deal, merchantName: "Coffee Hub" }).then(() => {
      navigate("/merchant/deals");
    });
  };

  return (
    <div>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Add new deal</h1>
        </div>
        <div className="space-y-3">
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="text-sm font-medium text-slate-400"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={deal.title}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-slate-400"
            >
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={deal.description}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-2">
            <label
              htmlFor="code"
              className="text-sm font-medium text-slate-400"
            >
              Code
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={deal.code}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <label
            htmlFor="validUntil"
            className="text-sm font-medium text-slate-400"
          >
            Valid until
          </label>
          <input
            type="date"
            id="validUntil"
            name="validUntil"
            value={deal.validUntil}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary"
          />
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <label
            htmlFor="category"
            className="text-sm font-medium text-slate-400"
          >
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={deal.category}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary"
          />
        </div>
      </div>

      <button 
      className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-orange-03 px-4 py-2 text-xs font-semibold text-black shadow hover:bg-[--color-orange-05]"
      onClick={handleAddDeal}
      >
        Add deal
      </button>
    </div>
  );
}
