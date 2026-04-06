import type { Deposit } from "../types";
import { ROI_RATES } from "../types";

interface ActiveDepositsProps {
  deposits: Deposit[];
  onDeposit: () => void;
}

const ROI_LABELS = ["2%", "3%", "1%"];
const ASSET_ICONS: Record<string, string> = {
  ICP: "⬡",
  BTC: "₿",
  BCH: "Ƀ",
  BNB: "◈",
  EGLD: "⬟",
};

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 60;
  const h = 24;
  const pts = values
    .map(
      (v, i) =>
        `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`,
    )
    .join(" ");
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label="Earnings trend sparkline"
    >
      <polyline
        points={pts}
        fill="none"
        stroke="#22C55E"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ActiveDeposits({
  deposits,
  onDeposit,
}: ActiveDepositsProps) {
  const maxRoi =
    deposits.length > 0
      ? Math.max(...deposits.map((_, i) => ROI_RATES[i] ?? 0))
      : 0;

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="card-heading text-[#FF8C00]">ACTIVE DEPOSITS</h2>
        <button
          type="button"
          data-ocid="deposits.open_modal_button"
          onClick={onDeposit}
          className="cyber-btn-primary text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-lg flex items-center gap-1.5"
        >
          <span className="text-base leading-none">+</span> MAKE DEPOSIT
        </button>
      </div>

      {deposits.length === 0 ? (
        <div
          data-ocid="deposits.empty_state"
          className="text-center py-8 text-[#6B7C8F] text-sm"
        >
          <div className="text-3xl mb-2 opacity-40">⬡</div>
          <p className="font-medium">No active deposits.</p>
          <p className="text-xs mt-1">
            Make your first deposit to begin earning.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-bold tracking-[0.14em] text-[#6B7C8F] uppercase border-b border-white/5">
                <th className="pb-2 text-left">#</th>
                <th className="pb-2 text-left">ASSET</th>
                <th className="pb-2 text-right">AMOUNT</th>
                <th className="pb-2 text-right">ROI/DAY</th>
                <th className="pb-2 text-right">DAILY $</th>
                <th className="pb-2 text-right">TREND</th>
              </tr>
            </thead>
            <tbody>
              {deposits.slice(0, 3).map((dep, i) => {
                const roi = ROI_RATES[i] ?? 0;
                const daily = dep.amount * roi;
                const isHighest = roi === maxRoi;
                const sparkData = [
                  daily * 0.92,
                  daily * 0.98,
                  daily * 0.95,
                  daily * 1.02,
                  daily * 1.0,
                  daily * 1.04,
                  daily,
                ];
                return (
                  <tr
                    key={dep.id}
                    data-ocid={`deposits.row.item.${i + 1}`}
                    className={`border-b border-white/5 transition-all ${
                      isHighest
                        ? "bg-[#FF8C00]/5 shadow-[inset_0_0_12px_rgba(255,140,0,0.06)]"
                        : ""
                    }`}
                  >
                    <td className="py-2.5 text-[#6B7C8F] font-mono text-xs">
                      {i + 1}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-lg leading-none"
                          style={{ color: "#FF8C00" }}
                        >
                          {ASSET_ICONS[dep.asset] ?? "◈"}
                        </span>
                        <span className="font-bold text-[#E6EDF3] text-xs tracking-wide">
                          {dep.asset}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-mono text-[#E6EDF3] text-xs">
                      ${dep.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{
                          color: "#22C55E",
                          background: "rgba(34,197,94,0.12)",
                          border: "1px solid rgba(34,197,94,0.3)",
                        }}
                      >
                        {ROI_LABELS[i]}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-[#22C55E] text-xs">
                      ${daily.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right">
                      <Sparkline values={sparkData} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
