import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useDeals } from "../../context/useDeals";
import { useAuth } from "../../context/useAuth";
import Skeleton from "../../components/Skeleton";
import RedeemModal from "./components/RedeemModal";

export default function DealsPage() {
  const { deals, loading: dealsLoading, error: dealsError } = useDeals();
  const { user } = useAuth();
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("a-z");
  const [redeemedCounts, setRedeemedCounts] = useState(new Map());
  const [redeemError, setRedeemError] = useState("");
  const [selectedDealTotalRedeemed, setSelectedDealTotalRedeemed] = useState(0);
  const [checkingLimits, setCheckingLimits] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadRedemptions = async () => {
      const q = query(
        collection(db, "redemptions"),
        where("userId", "==", user.uid),
      );
      const snap = await getDocs(q);
      const next = new Map();
      snap.docs.forEach((d) => {
        const dealId = d.data().dealId;
        if (!dealId) return;
        next.set(dealId, (next.get(dealId) || 0) + 1);
      });
      setRedeemedCounts(next);
    };
    loadRedemptions();
  }, [user]);

  const openRedeemModal = async (deal) => {
    setSelectedDeal(deal);
    setRedeemError("");
    setSelectedDealTotalRedeemed(0);

    // If the deal has a total cap, fetch current total so we can show UI state.
    if (deal?.maxTotalRedemptions != null) {
      setCheckingLimits(true);
      try {
        const totalSnap = await getDocs(
          query(collection(db, "redemptions"), where("dealId", "==", deal.id)),
        );
        setSelectedDealTotalRedeemed(totalSnap.size);
      } catch {
        // If we can't fetch, we still enforce at redeem-time.
        setSelectedDealTotalRedeemed(0);
      } finally {
        setCheckingLimits(false);
      }
    }
  };

  const closeRedeemModal = () => {
    setSelectedDeal(null);
    setRedeemError("");
    setSelectedDealTotalRedeemed(0);
    setCheckingLimits(false);
  };

  const handleSliderActivate = async () => {
    if (!selectedDeal || !user) return false;
    setRedeemError("");

    const maxTotal = selectedDeal.maxTotalRedemptions ?? null;
    const maxPerUser = selectedDeal.maxPerUserRedemptions ?? null;
    const currentUserCount = redeemedCounts.get(selectedDeal.id) || 0;

    // Simple enforcement (client-side): count existing redemptions
    if (maxTotal != null) {
      const totalSnap = await getDocs(
        query(
          collection(db, "redemptions"),
          where("dealId", "==", selectedDeal.id),
        ),
      );
      if (totalSnap.size >= maxTotal) {
        setRedeemError(
          "This offer has reached its maximum number of redemptions.",
        );
        return false;
      }
    }

    if (maxPerUser != null) {
      // Use the already-loaded per-user count for this deal.
      if (currentUserCount >= maxPerUser) {
        setRedeemError(
          "You’ve reached the maximum number of redemptions for this offer.",
        );
        return false;
      }
    }

    await addDoc(collection(db, "redemptions"), {
      userId: user.uid,
      dealId: selectedDeal.id,
      merchantId: selectedDeal.merchantId ?? null,
      redeemedAt: new Date().toISOString(),
    });
    setRedeemedCounts((prev) => {
      const next = new Map(prev);
      next.set(selectedDeal.id, (next.get(selectedDeal.id) || 0) + 1);
      return next;
    });
    if (selectedDeal.maxTotalRedemptions != null) {
      setSelectedDealTotalRedeemed((prev) => prev + 1);
    }
    return true;
  };

  const categories = Array.from(
    new Set(deals.map((deal) => deal.category)),
  ).filter(Boolean);
  const filteredDeals = deals
    .filter(
      (deal) => deal.category === selectedCategory || selectedCategory === null,
    )
    .filter((deal) =>
      deal.merchantName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const createdAtMs = (value) => {
    if (!value) return 0;
    if (typeof value === "object" && typeof value.toMillis === "function")
      return value.toMillis();
    const t = new Date(value).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  if (sortBy === "a-z") {
    filteredDeals.sort((a, b) => a.merchantName.localeCompare(b.merchantName));
  } else if (sortBy === "newest") {
    filteredDeals.sort((a, b) => {
      const byCreated = createdAtMs(b.createdAt) - createdAtMs(a.createdAt);
      if (byCreated !== 0) return byCreated;
      // fallback for older docs without createdAt
      return (
        new Date(b.validUntil).getTime() - new Date(a.validUntil).getTime()
      );
    });
  }

  if (dealsLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/65 px-4 py-3 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="ml-auto flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Skeleton className="h-9 w-full sm:w-52" />
            <Skeleton className="h-9 w-full sm:w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/10 bg-slate-900/65 p-4 shadow-[var(--app-shadow-lg)] backdrop-blur-xl"
            >
              <Skeleton className="h-10 w-10" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (dealsError) {
    return (
      <div className="rounded-3xl border border-red-500/35 bg-red-950/25 p-4 text-sm text-red-300">
        Failed to load deals. Please refresh.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-900/55 p-5 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-slate-300">
          Employee catalog
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Global reward catalog
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          1000+ retail gift cards and prepaid offers, physical and online
          options.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/65 px-4 py-3 shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
        {/* Categories Filter */}
        <div className="flex flex-wrap gap-2 text-[0.7rem] text-slate-600">
          <button
            key="all"
            type="button"
            className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ring-1 ring-inset transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              selectedCategory === null
                ? "bg-amber-300/15 text-amber-100 ring-amber-300/45"
                : "bg-white/6 text-slate-200 ring-white/15 hover:bg-white/12"
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ring-1 ring-inset transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                selectedCategory === category
                  ? "bg-amber-300/15 text-amber-100 ring-amber-300/45"
                  : "bg-white/6 text-slate-200 ring-white/15 hover:bg-white/12"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="ml-auto flex w-full flex-col gap-2 text-xs text-slate-200 sm:w-auto sm:flex-row sm:items-center">
          <input
            type="search"
            placeholder="Search brands"
            className="w-full rounded-full border border-white/15 bg-slate-800/65 px-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:border-amber-300/75 focus:outline-none focus:ring-1 focus:ring-amber-300/70 sm:w-48"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="w-full rounded-full border border-white/15 bg-slate-800/65 px-3 py-1.5 text-xs text-white focus:border-amber-300/75 focus:outline-none focus:ring-1 focus:ring-amber-300/70 sm:w-40"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="a-z">Sort: A–Z</option>
            <option value="newest">Sort: Newest</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {filteredDeals.length === 0 ? (
          <div className="md:col-span-3 rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-center shadow-[var(--app-shadow-lg)] backdrop-blur-xl">
            <p className="text-sm font-semibold text-white">No matching deals found</p>
            <p className="mt-1 text-xs text-slate-400">
              Try another category, or clear search.
            </p>
          </div>
        ) : null}
        {filteredDeals.map((deal) =>
          // per-user redemption count for this deal
          (() => {
            const userCount = redeemedCounts.get(deal.id) || 0;
            const maxPerUser = deal.maxPerUserRedemptions ?? null;
            const limitReached = maxPerUser != null && userCount >= maxPerUser;

            return (
              <article
                key={deal.id}
                className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/65 p-4 shadow-[var(--app-shadow-lg)] backdrop-blur-xl transition duration-200 will-change-transform hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-900/75"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-xs font-semibold text-white ring-1 ring-white/20">
                    {deal.merchantName[0]}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-slate-300">
                      {deal.category}
                    </p>
                    <h2 className="text-sm font-semibold text-white">
                      {deal.merchantName}
                    </h2>
                    <p className="text-xs text-slate-200">{deal.title}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[0.7rem] text-slate-200">
                  <span className="inline-flex items-center rounded-full bg-amber-300/10 px-2 py-0.5 font-semibold text-amber-100 ring-1 ring-amber-300/35">
                    {deal.discount} off
                  </span>
                  {deal.code && (
                    <code className="rounded-md bg-slate-950/70 px-2 py-0.5 font-mono text-[0.7rem] text-white ring-1 ring-white/10">
                      {deal.code}
                    </code>
                  )}
                  <span className="text-[0.7rem] text-slate-300">
                    Valid until{" "}
                    <span className="font-medium text-slate-100">
                      {deal.validUntil}
                    </span>
                  </span>
                </div>
                <div className="mt-4">
                  {limitReached ? (
                    <div className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400/15 px-3 py-2 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/25">
                      {maxPerUser
                        ? `Redeemed ${userCount}/${maxPerUser}`
                        : "Redeemed"}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={`!text-white inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-xs font-bold tracking-wide shadow-lg transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                        userCount > 0
                          ? "bg-gradient-to-r from-[--color-orange-02] to-[--color-orange-04] text-slate-950 ring-1 ring-white/25 shadow-[0_18px_45px_-28px_rgba(255,186,0,0.95)] hover:from-[--color-orange-01] hover:to-[--color-orange-04]"
                          : "bg-gradient-to-r from-[--color-orange-03] to-[--color-orange-04] text-slate-950 shadow-black/20 hover:from-[--color-orange-02] hover:to-[--color-orange-04]"
                      }`}
                      onClick={() => openRedeemModal(deal)}
                    >
                      {userCount > 0 ? "Redeem again" : "Redeem offer"}
                    </button>
                  )}
                </div>
              </article>
            );
          })(),
        )}
      </div>

      <RedeemModal
        isOpen={Boolean(selectedDeal)}
        deal={selectedDeal}
        redeemedCountByUser={
          selectedDeal ? (redeemedCounts.get(selectedDeal.id) || 0) : 0
        }
        selectedDealTotalRedeemed={selectedDealTotalRedeemed}
        checkingLimits={checkingLimits}
        redeemError={redeemError}
        onClose={closeRedeemModal}
        onRedeemAttempt={handleSliderActivate}
      />
    </div>
  );
}
