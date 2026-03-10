import { useState } from 'react';
import { mockDeals } from '../../data/mockDeals';

export default function DealsPage() {
  const [redeemed, setRedeemed] = useState(new Set());

  const handleRedeem = (id) => {
    setRedeemed((prev) => new Set(prev).add(id));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
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
        {mockDeals.map((deal) => (
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
              {redeemed.has(deal.id) ? (
                <div className="inline-flex w-full items-center justify-center rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  Redeemed
                </div>
              ) : (
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800"
                  onClick={() => handleRedeem(deal.id)}
                >
                  Redeem offer
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
