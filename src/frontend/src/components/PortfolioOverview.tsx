import type { Deposit } from "../types";
import { ROI_RATES } from "../types";

interface PortfolioOverviewProps {
  deposits: Deposit[];
}

const ASSET_COLORS: Record<string, string> = {
  ICP: "#FF8C00",
  BTC: "#F59E0B",
  BCH: "#10B981",
  BNB: "#3B82F6",
  EGLD: "#8B5CF6",
};

export default function PortfolioOverview({
  deposits,
}: PortfolioOverviewProps) {
  // Only count Verified deposits for portfolio value
  const verifiedDeposits = deposits.filter((d) => d.status === "Verified");
  const totalPortfolioValue = verifiedDeposits.reduce(
    (s, d) => s + d.amount,
    0,
  );

  // ROI based on all active (verified) deposits
  let dailyEarnings = 0;
  verifiedDeposits.slice(0, 3).forEach((d, i) => {
    dailyEarnings += d.amount * (ROI_RATES[i] ?? 0);
  });

  const monthlyProjection = dailyEarnings * 30;

  const assetTotals: Record<string, number> = {};
  for (const d of deposits) {
    assetTotals[d.asset] = (assetTotals[d.asset] ?? 0) + d.amount;
  }
  const maxAssetTotal = Math.max(1, ...Object.values(assetTotals));

  const stats = [
    {
      label: "PORTFOLIO VALUE",
      value: `$${totalPortfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      sub: "verified deposits only",
      color: "#FF8C00",
    },
    {
      label: "DAILY EARNINGS",
      value: `$${dailyEarnings.toFixed(2)}`,
      sub: "projected/day",
      color: "#22C55E",
    },
    {
      label: "MONTHLY PROJ.",
      value: `$${monthlyProjection.toFixed(2)}`,
      sub: "30-day estimate",
      color: "#3B82F6",
    },
    {
      label: "ACTIVE DEPOSITS",
      value: String(verifiedDeposits.length),
      sub: "verified & active",
      color: "#8B5CF6",
    },
  ];

  return (
    <div className="cyber-card">
      <h2 className="card-heading text-[#FF8C00] mb-4">PORTFOLIO OVERVIEW</h2>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-[#0B0F14] rounded-xl p-3 border border-white/5"
          >
            <div
              className="text-[10px] font-bold tracking-[0.14em] uppercase mb-1"
              style={{ color: s.color }}
            >
              {s.label}
            </div>
            <div className="text-xl font-extrabold text-[#E6EDF3] leading-tight">
              {s.value}
            </div>
            <div className="text-[10px] text-[#6B7C8F] mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#93A4B7] mb-2">
          ASSET ALLOCATION
        </div>
        {Object.keys(assetTotals).length === 0 ? (
          <div className="text-xs text-[#6B7C8F] italic">No deposits yet.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {Object.entries(assetTotals).map(([asset, amount]) => (
              <div key={asset} className="flex items-center gap-2">
                <div className="w-8 text-[10px] font-bold text-[#93A4B7]">
                  {asset}
                </div>
                <div className="flex-1 bg-[#0B0F14] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(amount / maxAssetTotal) * 100}%`,
                      backgroundColor: ASSET_COLORS[asset] ?? "#FF8C00",
                      boxShadow: `0 0 6px ${ASSET_COLORS[asset] ?? "#FF8C00"}80`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-[#E6EDF3] w-16 text-right font-mono">
                  ${amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
