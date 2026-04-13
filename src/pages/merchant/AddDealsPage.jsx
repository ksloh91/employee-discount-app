import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeals } from "../../context/useDeals";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../components/useToast";
import { useConfirm } from "../../components/useConfirm";

export default function AddDealsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addDeal } = useDeals();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const today = new Date().toISOString().split("T")[0];
  const [formError, setFormError] = useState("");
  const [deal, setDeal] = useState({
    title: "",
    description: "",
    code: "",
    validUntil: "",
    category: "",
    merchant: "",
    terms: "",
    image: "",
    maxTotalRedemptions: "",
    maxPerUserRedemptions: "",
  });

  const sanitizeIntegerInput = (value) => value.replace(/[^\d]/g, "");
  const blockDecimalInput = (event) => {
    if ([".", ",", "e", "E", "+", "-"].includes(event.key)) {
      event.preventDefault();
    }
  };
  const requiredFields = [
    "title",
    "description",
    "code",
    "validUntil",
    "category",
  ];
  const isFormComplete = requiredFields.every(
    (field) => String(deal[field] ?? "").trim() !== "",
  );
  const categoryOptions = [
    "Food & Beverage",
    "Retail",
    "Health & Wellness",
    "Fitness",
    "Travel",
    "Entertainment",
    "Technology",
    "Services",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "maxTotalRedemptions" || name === "maxPerUserRedemptions") {
      setDeal({ ...deal, [name]: sanitizeIntegerInput(value) });
      return;
    }
    setDeal({ ...deal, [name]: value });
  };

  const handleAddDeal = async () => {
    if (!user || user.role !== 'merchant') return;
    if (!isFormComplete) {
      setFormError("Please fill in all fields before creating a deal.");
      return;
    }
    setFormError("");
    const ok = await confirm({
      title: "Create this deal?",
      description: `Add “${deal.title.trim() || "this offer"}” to your deals list?`,
      confirmText: "Create deal",
      cancelText: "Cancel",
      variant: "default",
    });
    if (!ok) return;

    addDeal({
      ...deal,
      merchantId: user.merchantId,              // must match user doc in Firestore
      merchantName: user.displayName || 'Merchant',
      maxTotalRedemptions:
        deal.maxTotalRedemptions === ""
          ? null
          : Number.parseInt(deal.maxTotalRedemptions, 10),
      maxPerUserRedemptions:
        deal.maxPerUserRedemptions === ""
          ? null
          : Number.parseInt(deal.maxPerUserRedemptions, 10),
    })
      .then(() => {
        toast({
          title: "Deal created",
          description: "Your new offer has been added to your deals list.",
          variant: "success",
        });
        navigate("/merchant/deals");
      })
      .catch(() => {
        toast({
          title: "Couldn't create deal",
          description: "Something went wrong. Please try again.",
          variant: "error",
        });
      });
  };



  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Add new deal</h1>
      </div>
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
      <div className="space-y-2">
        <label
          htmlFor="category"
          className="text-sm font-medium text-slate-400"
        >
          Category
        </label>
        <select
          id="category"
          name="category"
          value={deal.category}
          onChange={handleChange}
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary"
        >
          <option value="">Select a category</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
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
          min={today}
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="maxTotalRedemptions" className="text-sm font-medium text-slate-400">
            Max total redemptions (optional)
          </label>
          <input
            type="text"
            min="1"
            step="1"
            inputMode="numeric"
            pattern="[0-9]*"
            id="maxTotalRedemptions"
            name="maxTotalRedemptions"
            value={deal.maxTotalRedemptions}
            onChange={handleChange}
            onKeyDown={blockDecimalInput}
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary"
            placeholder="e.g. 100"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="maxPerUserRedemptions" className="text-sm font-medium text-slate-400">
            Max per user (optional)
          </label>
          <input
            type="text"
            min="1"
            step="1"
            inputMode="numeric"
            pattern="[0-9]*"
            id="maxPerUserRedemptions"
            name="maxPerUserRedemptions"
            value={deal.maxPerUserRedemptions}
            onChange={handleChange}
            onKeyDown={blockDecimalInput}
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary"
            placeholder="Leave blank for no limit"
          />
        </div>
      </div>

      {formError && (
        <p className="mt-4 text-sm font-semibold text-red-400">{formError}</p>
      )}
      <button 
      className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-orange-03 px-4 py-2 text-xs font-semibold text-black shadow hover:bg-[--color-orange-05] disabled:cursor-not-allowed disabled:opacity-60"
      onClick={handleAddDeal}
      disabled={!isFormComplete}
      >
        Add deal
      </button>
    </div>
  );
}
