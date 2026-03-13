import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useDeals } from '../../context/DealsContext';
import { useAuth } from '../../context/AuthContext';

export default function DealsPage() {
  const { deals } = useDeals();
  const { user } = useAuth();
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [sliderComplete, setSliderComplete] = useState(false);
  const [redeemedIds, setRedeemedIds] = useState(new Set());

  useEffect(() => {
    if (!user) return;
    const loadRedemptions = async () => {
      const q = query(
        collection(db, 'redemptions'),
        where('userId', '==', user.uid),
      );
      const snap = await getDocs(q);
      const ids = new Set(snap.docs.map((d) => d.data().dealId));
      setRedeemedIds(ids);
    };
    loadRedemptions();
  }, [user]);

  const openRedeemModal = (deal) => {
    setSelectedDeal(deal);
    setSliderComplete(redeemedIds.has(deal.id));
  };

  const closeRedeemModal = () => {
    setSelectedDeal(null);
    setSliderComplete(false);
  };

  const handleSliderActivate = async () => {
    if (!selectedDeal || sliderComplete || !user) return;
    setSliderComplete(true);
    await addDoc(collection(db, 'redemptions'), {
      userId: user.uid,
      dealId: selectedDeal.id,
      merchantId: selectedDeal.merchantId ?? null,
      redeemedAt: new Date().toISOString(),
    });
    setRedeemedIds((prev) => new Set(prev).add(selectedDeal.id));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Global reward catalog
        </h1>
        <p className="text-sm text-slate-600">
          1000+ retail gift cards and prepaid offers, physical and online options.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap gap-2 text-[0.7rem] text-slate-600">
          <button
            type="button"
            className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 font-medium text-white"
          >
            All
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 hover:bg-slate-200"
          >
            Food &amp; drink
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 hover:bg-slate-200"
          >
            Retail
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 hover:bg-slate-200"
          >
            Health &amp; fitness
          </button>
        </div>
        <div className="ml-auto flex w-full flex-col gap-2 text-xs text-slate-500 sm:w-auto sm:flex-row sm:items-center">
          <input
            type="search"
            placeholder="Search brands"
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-48"
          />
          <select
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-40"
          >
            <option>Sort: Recommended</option>
            <option>Sort: A–Z</option>
            <option>Sort: Newest</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {deals.map((deal) => (
          <article
            key={deal.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {deal.merchantName[0]}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {deal.category}
                </p>
                <h2 className="text-sm font-semibold text-slate-900">{deal.merchantName}</h2>
                <p className="text-xs text-slate-500">{deal.title}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.7rem] text-slate-500">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-800">
                {deal.discount} off
              </span>
              {deal.code && (
                <code className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-[0.7rem] text-white">
                  {deal.code}
                </code>
              )}
              <span className="text-[0.7rem] text-slate-500">
                Valid until <span className="font-medium text-slate-700">{deal.validUntil}</span>
              </span>
            </div>
            <div className="mt-4">
              {redeemedIds.has(deal.id) ? (
                <div className="inline-flex w-full items-center justify-center rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  Redeemed
                </div>
              ) : (
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-full bg-orange-03 px-4 py-2 text-xs font-semibold text-black shadow hover:bg-[--color-orange-05]"
                  onClick={() => openRedeemModal(deal)}
                >
                  Redeem offer
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {selectedDeal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="space-y-2">
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.25em] text-slate-500">
                Confirm redemption
              </p>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                {selectedDeal.merchantName}
              </h2>
              <p className="text-xs text-slate-600">{selectedDeal.title}</p>
            </div>

            <p className="mt-4 text-xs text-slate-600">
              Are you sure you want to redeem this offer now? Some offers may be single‑use and
              start their validity as soon as you reveal the code.
            </p>

            <div className="mt-5 space-y-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Slide to redeem
              </p>
              <button
                type="button"
                onClick={handleSliderActivate}
                className="relative flex h-10 w-full items-center rounded-full bg-slate-100 text-xs font-medium text-slate-600 shadow-inner transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <span
                  className={`absolute left-0 flex h-9 w-24 items-center justify-center rounded-full bg-orange-03 text-[0.7rem] font-semibold text-slate-950 shadow transition-transform ${
                    sliderComplete ? 'translate-x-[calc(100%-4.75rem)]' : 'translate-x-0'
                  }`}
                >
                  Slide
                </span>
                <span className="mx-auto text-[0.7rem]">
                  {sliderComplete ? 'Redeemed' : 'Slide to reveal QR & code'}
                </span>
              </button>
            </div>

            {sliderComplete && (
              <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white text-[0.6rem] font-semibold text-slate-500 ring-1 ring-dashed ring-slate-300">
                    QR
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-900">Show this at checkout</p>
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
              <button
                type="button"
                className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                onClick={closeRedeemModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
