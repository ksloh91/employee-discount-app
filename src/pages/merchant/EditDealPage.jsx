import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeals } from "../../context/useDeals";
import { useToast } from "../../components/useToast";
import { useConfirm } from "../../components/useConfirm";

export default function EditDealPage() {
  const navigate = useNavigate();
  const { deals, updateDeal, deleteDeal } = useDeals();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { id } = useParams();
  const today = new Date().toISOString().split("T")[0];
  const [deal, setDeal] = useState(() => deals.find((d) => d.id === id) ?? null);
  const [formError, setFormError] = useState("");
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
  const isFormComplete = deal
    ? requiredFields.every((field) => String(deal[field] ?? "").trim() !== "")
    : false;
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
  const hasCustomCategory =
    deal?.category && !categoryOptions.includes(deal.category);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "maxTotalRedemptions" || name === "maxPerUserRedemptions") {
      setDeal({ ...deal, [name]: sanitizeIntegerInput(value) });
      return;
    }
    setDeal({ ...deal, [name]: value });
  };
  const handleEditDeal = async () => {
    if (!deal) return;
    if (!isFormComplete) {
      setFormError("Please fill in all fields before updating this deal.");
      return;
    }
    setFormError("");
    const ok = await confirm({
      title: "Save changes?",
      description: `Update “${String(deal.title ?? "").trim() || "this deal"}” with the information you entered?`,
      confirmText: "Save",
      cancelText: "Cancel",
      variant: "default",
    });
    if (!ok) return;

    updateDeal({
      ...deal,
      maxTotalRedemptions:
        deal.maxTotalRedemptions === "" || deal.maxTotalRedemptions == null
          ? null
          : Number.parseInt(deal.maxTotalRedemptions, 10),
      maxPerUserRedemptions:
        deal.maxPerUserRedemptions === "" || deal.maxPerUserRedemptions == null
          ? null
          : Number.parseInt(deal.maxPerUserRedemptions, 10),
    })
      .then(() => {
        toast({
          title: "Deal updated",
          description: "Your changes have been saved.",
          variant: "success",
        });
        navigate("/merchant/deals");
      })
      .catch(() => {
        toast({
          title: "Couldn't update deal",
          description: "Something went wrong. Please try again.",
          variant: "error",
        });
      });
  };

  const handleDeleteDeal = async () => {
    if (!deal) return;
    const ok = await confirm({
      title: "Delete this deal?",
      description: `Remove “${String(deal.title ?? "").trim() || "this offer"}” permanently? This cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!ok) return;

    deleteDeal(deal.id)
      .then(() => {
        toast({
          title: "Deal deleted",
          description: "This offer has been removed from your deals list.",
          variant: "success",
        });
        navigate("/merchant/deals");
      })
      .catch(() => {
        toast({
          title: "Couldn't delete deal",
          description: "Something went wrong. Please try again.",
          variant: "error",
        });
      });
  };
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">Edit deal</h1>
      </div>
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
      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium text-slate-400">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={deal?.category ?? ""}
          onChange={handleChange}
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary"
        >
          <option value="">Select a category</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
          {hasCustomCategory && (
            <option value={deal.category}>{deal.category}</option>
          )}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="validUntil" className="text-sm font-medium text-slate-400">
          Valid until
        </label>
        <input type="date" id="validUntil" name="validUntil" value={deal?.validUntil} onChange={handleChange} min={today} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-primary" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
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
            value={deal?.maxTotalRedemptions ?? ""}
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
            value={deal?.maxPerUserRedemptions ?? ""}
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
      <button className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-orange-03 px-4 py-2 text-xs font-semibold text-black shadow hover:bg-[--color-orange-05] disabled:cursor-not-allowed disabled:opacity-60"
      onClick={handleEditDeal}
      disabled={!isFormComplete}
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