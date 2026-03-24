import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useDeals } from "../../context/DealsContext";

function isoToMs(value) {
  if (!value) return 0;
  if (typeof value === "object" && typeof value.toMillis === "function")
    return value.toMillis();
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

export default function MerchantDashboardPage() {
  const { user } = useAuth();
  const { deals } = useDeals();
  const [loading, setLoading] = useState(true);
  const [redemptions, setRedemptions] = useState([]);
  const [redeemers, setRedeemers] = useState(new Map());

  useEffect(() => {
    if (!user?.merchantId) return;

    const load = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "redemptions"),
          where("merchantId", "==", user.merchantId),
        );
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        rows.sort((a, b) => isoToMs(b.redeemedAt) - isoToMs(a.redeemedAt));
        setRedemptions(rows);

        const userIds = Array.from(
          new Set(rows.map((r) => r.userId).filter(Boolean)),
        );
        const pairs = await Promise.all(
          userIds.map(async (uid) => {
            try {
              const userSnap = await getDocs(
                query(collection(db, "users"), where("__name__", "==", uid)),
              );
              const doc0 = userSnap.docs[0];
              return [uid, doc0 ? doc0.data() : null];
            } catch {
              return [uid, null];
            }
          }),
        );
        setRedeemers(new Map(pairs));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.merchantId]);

  const byDealId = useMemo(() => new Map(deals.map((d) => [d.id, d])), [deals]);

  const stats = useMemo(() => {
    const total = redemptions.length;
    // const uniqueCustomers = new Set(redemptions.map((r) => r.userId).filter(Boolean)).size;
    const now = Date.now();
    const last7d = redemptions.filter(
      (r) => now - isoToMs(r.redeemedAt) <= 7 * 24 * 60 * 60 * 1000,
    ).length;

    const counts = new Map();
    for (const r of redemptions) {
      if (!r.dealId) continue;
      counts.set(r.dealId, (counts.get(r.dealId) || 0) + 1);
    }
    const usage = deals
      .filter((d) => d.merchantId === user?.merchantId || d.merchantName === user?.displayName)
      .map((d) => {
        const used = counts.get(d.id) || 0;
        const max = d.maxTotalRedemptions ?? null;
        const soldOut = max != null && used >= max;
        return { deal: d, used, max, soldOut };
      })
      .sort((a, b) => b.used - a.used);

    const topDeals = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([dealId, count]) => ({
        dealId,
        count,
        deal: byDealId.get(dealId),
      }));

    return { total, last7d, topDeals, usage };
  }, [redemptions, byDealId, deals, user?.merchantId, user?.displayName]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Merchant dashboard
        </h1>
        <p className="text-sm text-slate-300">
          Track redemptions, see what’s working, and spot your best-performing
          deals.
        </p>
      </div>

      {/* {!user?.merchantId ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
          Your account is missing a <span className="font-semibold text-slate-100">merchantId</span>.
          Add it in Firestore under <code className="rounded bg-slate-950 px-1 py-0.5 text-slate-100">users/{'{uid}'}</code>{' '}
          so we can load your redemption analytics.
        </div>
      ) : ( */}
      <>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Total redemptions
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {stats.total}
            </p>
          </div>
          {/* <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Unique redeemers
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{stats.uniqueCustomers}</p>
            </div> */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Redemptions (7d)
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {stats.last7d}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-white">Top deals</h2>
            <div className="mt-3 space-y-3 text-sm">
              {stats.topDeals.length === 0 ? (
                <p className="text-slate-300">No redemptions yet.</p>
              ) : (
                stats.topDeals.map((row) => (
                  <div
                    key={row.dealId}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-slate-100">
                        {row.deal?.title || row.dealId}
                      </p>
                      {/* <p className="truncate text-xs text-slate-400">
                        {row.deal?.discount || "—"}
                      </p>{" "} */}
                    </div>
                    <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-100">
                      {row.count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-white">
              Recent redemptions
            </h2>
            <div className="mt-3 space-y-3">
              {loading ? (
                <p className="text-sm text-slate-300">Loading…</p>
              ) : redemptions.length === 0 ? (
                <p className="text-sm text-slate-300">No redemptions yet.</p>
              ) : (
                redemptions.slice(0, 10).map((r) => {
                  const deal = byDealId.get(r.dealId);
                  const redeemer = redeemers.get(r.userId);
                  return (
                    <div key={r.id} className="rounded-xl bg-slate-950/50 p-3">
                      <p className="text-sm font-semibold text-slate-100">
                        {deal?.title || r.dealId}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Redeemer:{" "}
                        <span className="font-medium text-slate-200">
                          {redeemer?.email || r.userId || "Unknown"}
                        </span>
                        {" · "}
                        {r.redeemedAt
                          ? new Date(r.redeemedAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-sm font-semibold text-white">Redemption limits</h2>
          <p className="mt-1 text-xs text-slate-400">
            Track usage vs the max total redemptions set per deal.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {stats.usage.length === 0 ? (
              <p className="text-sm text-slate-300 md:col-span-2">
                No deals found for this merchant yet.
              </p>
            ) : (
              stats.usage.map(({ deal, used, max, soldOut }) => (
                <div
                  key={deal.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-100">
                        {deal.title}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {deal.category || 'Uncategorized'}
                        {deal.discount ? ` · ${deal.discount} off` : ''}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        soldOut
                          ? 'bg-red-900/40 text-red-200 ring-1 ring-red-900/60'
                          : 'bg-emerald-900/30 text-emerald-200 ring-1 ring-emerald-900/50'
                      }`}
                    >
                      {soldOut ? 'Sold out' : 'Active'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                    <p className="text-slate-300">
                      Used:{' '}
                      <span className="font-semibold text-slate-100">
                        {used}
                      </span>
                      {max != null ? (
                        <>
                          {' '}
                          / <span className="font-semibold text-slate-100">{max}</span>
                        </>
                      ) : (
                        <>
                          {' '}
                          / <span className="font-semibold text-slate-100">∞</span>
                        </>
                      )}
                    </p>
                    <p className="text-slate-400">
                      Per user:{' '}
                      <span className="font-semibold text-slate-200">
                        {deal.maxPerUserRedemptions ?? 1}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </>
      {/* )} */}
    </div>
  );
}
