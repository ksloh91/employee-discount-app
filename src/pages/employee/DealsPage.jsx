import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useDeals } from "../../context/DealsContext";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function DealsPage() {
  const { deals } = useDeals();
  const { user } = useAuth();
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("a-z");
  const [sliderComplete, setSliderComplete] = useState(false);
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
    // Slider is per modal session; allow redeem again until limits reached.
    setSliderComplete(false);
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
    setSliderComplete(false);
    setRedeemError("");
    setSelectedDealTotalRedeemed(0);
    setCheckingLimits(false);
  };

  const handleSliderActivate = async () => {
    if (!selectedDeal || sliderComplete || !user) return;
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
        return;
      }
    }

    if (maxPerUser != null) {
      // Use the already-loaded per-user count for this deal.
      if (currentUserCount >= maxPerUser) {
        setRedeemError(
          "You’ve reached the maximum number of redemptions for this offer.",
        );
        return;
      }
    }

    setSliderComplete(true);
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-slate-300">
          Employee catalog
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Global reward catalog
        </h1>
        <p className="text-sm text-slate-300">
          1000+ retail gift cards and prepaid offers, physical and online
          options.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.65)] backdrop-blur-xl">
        {/* Categories Filter */}
        <div className="flex flex-wrap gap-2 text-[0.7rem] text-slate-600">
          <Button
            key="all"
            type="button"
            size="xs"
            variant="ghost"
            className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ring-1 ring-inset transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              selectedCategory === null
                ? "bg-white text-slate-900 ring-white/40 hover:bg-white hover:text-slate-900"
                : "bg-white/10 text-white ring-white/20 hover:bg-white/15"
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              type="button"
              size="xs"
              variant="ghost"
              className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ring-1 ring-inset transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                selectedCategory === category
                  ? "bg-white text-slate-900 ring-white/40 hover:bg-white hover:text-slate-900"
                  : "bg-white/10 text-white ring-white/20 hover:bg-white/15"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex w-full flex-col gap-2 text-xs text-slate-200 sm:w-auto sm:flex-row sm:items-center">
          <Input
            type="search"
            placeholder="Search brands"
            className="w-full rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white placeholder:text-slate-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-48"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a-z">Sort: A–Z</SelectItem>
              <SelectItem value="newest">Sort: Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {filteredDeals.map((deal) =>
          // per-user redemption count for this deal
          (() => {
            const userCount = redeemedCounts.get(deal.id) || 0;
            const maxPerUser = deal.maxPerUserRedemptions ?? null;
            const limitReached = maxPerUser != null && userCount >= maxPerUser;

            return (
              <article
                key={deal.id}
                className="group flex flex-col justify-between rounded-3xl border border-white/20 bg-white/10 p-4 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.8)] backdrop-blur-xl transition will-change-transform hover:-translate-y-0.5 hover:bg-white/15 hover:shadow-[0_35px_90px_-60px_rgba(0,0,0,0.85)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-xs font-semibold text-white ring-1 ring-white/20">
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
                  <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 font-semibold text-white ring-1 ring-white/15">
                    {deal.discount} off
                  </span>
                  {deal.code && (
                    <code className="rounded-md bg-slate-950/60 px-2 py-0.5 font-mono text-[0.7rem] text-white ring-1 ring-white/10">
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
                    <Button
                      type="button"
                      variant="ghost"
                      className={`cursor-pointer w-full items-center justify-center rounded-full border-white/0 px-4 py-2 text-xs font-bold tracking-wide shadow-lg transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 hover:bg-transparent hover:!text-primary focus-visible:!text-white ${
                        userCount > 0
                          ? "bg-gradient-to-r from-[--color-orange-02] to-[--color-orange-04] ring-1 ring-white/25 shadow-[0_18px_45px_-28px_rgba(255,186,0,0.95)] hover:from-[--color-orange-01] hover:to-[--color-orange-04]"
                          : "bg-gradient-to-r from-[--color-orange-03] to-[--color-orange-04] shadow-black/20 hover:from-[--color-orange-02] hover:to-[--color-orange-04]"
                      }`}
                      style={{ color: "white !important" }}
                      onClick={() => openRedeemModal(deal)}
                    >
                      {userCount > 0 ? "Redeem again" : "Redeem offer"}
                    </Button>
                  )}
                </div>
              </article>
            );
          })(),
        )}
      </div>

      <Dialog
        open={!!selectedDeal}
        onOpenChange={(open) => {
          if (!open) closeRedeemModal();
        }}
      >
        <DialogPortal>
          <DialogOverlay className="px-4 animate-[fadeIn_160ms_ease-out]" />
          <DialogContent
            className="animate-[fadeScaleIn_180ms_ease-out]"
            showCloseButton={false}
          >
            {selectedDeal && (
              <>
                <DialogHeader>
                  <p className="text-[0.7rem] font-medium uppercase tracking-[0.25em] text-slate-500">
                    Confirm redemption
                  </p>
                  <DialogTitle className="text-lg font-semibold tracking-tight text-slate-900">
                    {selectedDeal.merchantName}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-600">
                    {selectedDeal.title}
                  </DialogDescription>
                </DialogHeader>

                <p className="mt-4 text-xs text-slate-600">
                  Are you sure you want to redeem this offer now? Some
                  offers may be single‑use and start their validity as soon as
                  you reveal the code.
                </p>

                <div className="mt-5 space-y-3">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Slide to redeem
                  </p>
                  <p className="text-[0.7rem] text-slate-500">
                    Redeemed by you:{" "}
                    <span className="font-semibold text-slate-700">
                      {redeemedCounts.get(selectedDeal.id) || 0}
                    </span>
                    {selectedDeal.maxPerUserRedemptions != null && (
                      <>
                        {" "}
                        /{" "}
                        <span className="font-semibold text-slate-700">
                          {selectedDeal.maxPerUserRedemptions}
                        </span>
                      </>
                    )}
                  </p>
                  {selectedDeal.maxTotalRedemptions != null && (
                    <p className="text-[0.7rem] text-slate-500">
                      Total redeemed:{" "}
                      <span className="font-semibold text-slate-700">
                        {selectedDealTotalRedeemed}
                      </span>{" "}
                      /{" "}
                      <span className="font-semibold text-slate-700">
                        {selectedDeal.maxTotalRedemptions}
                      </span>
                    </p>
                  )}
                  {redeemError && (
                    <p className="text-xs font-semibold text-red-600">
                      {redeemError}
                    </p>
                  )}
                </div>

                {(() => {
                  const perUserCount =
                    redeemedCounts.get(selectedDeal.id) || 0;
                  const maxPerUser = selectedDeal.maxPerUserRedemptions ?? null;
                  const maxTotal = selectedDeal.maxTotalRedemptions ?? null;
                  const perUserLimitReached =
                    maxPerUser != null && perUserCount >= maxPerUser;
                  const totalLimitReached =
                    maxTotal != null && selectedDealTotalRedeemed >= maxTotal;
                  const fullyRedeemed =
                    perUserLimitReached || totalLimitReached;

                  return (
                    <>
                      {fullyRedeemed && !redeemError && (
                        <p className="mt-2 text-xs font-semibold text-red-600">
                          Fully redeemed
                        </p>
                      )}
                      {checkingLimits && (
                        <p className="mt-2 text-xs text-slate-500">
                          Checking limits…
                        </p>
                      )}
                      <Button
                        type="button"
                        disabled={checkingLimits || fullyRedeemed}
                        variant="ghost"
                        className={`mt-3 relative flex h-10 w-full items-center justify-center rounded-full text-xs font-medium shadow-inner transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                          fullyRedeemed
                            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                            : "bg-slate-100 text-slate-600 hover:!bg-slate-200 hover:!text-slate-600"
                        }`}
                        onClick={handleSliderActivate}
                      >
                        <span
                          className={`absolute left-0 flex h-9 w-24 items-center justify-center rounded-full bg-orange-03 text-[0.7rem] font-semibold text-slate-950 shadow transition-transform ${
                            sliderComplete
                              ? "translate-x-[calc(100%-4.75rem)]"
                              : "translate-x-0"
                          }${fullyRedeemed ? " hidden" : ""}`}
                        >
                          Slide
                        </span>
                        <span className="mx-auto text-[0.7rem]">
                          {fullyRedeemed
                            ? "Limit reached"
                            : sliderComplete
                              ? "Redeemed"
                              : "Slide to reveal QR & code"}
                        </span>
                      </Button>
                    </>
                  );
                })()}

                {sliderComplete && (
                  <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white text-[0.6rem] font-semibold text-slate-500 ring-1 ring-dashed ring-slate-300">
                        QR
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-900">
                          Show this at checkout
                        </p>
                        <p className="text-[0.7rem] text-slate-600">
                          The QR code and promo code below are now active.
                        </p>
                      </div>
                    </div>
                    {selectedDeal.code && (
                      <div className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-center">
                        <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-slate-400">
                          Promo code
                        </p>
                        <p className="mt-1 font-mono text-sm font-semibold text-white">
                          {selectedDeal.code}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-5 flex justify-end gap-2 text-xs">
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 hover:!bg-transparent hover:text-slate-700"
                    onClick={closeRedeemModal}
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
