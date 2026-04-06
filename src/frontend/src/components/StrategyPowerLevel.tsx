import type { Deposit } from "../types";

interface StrategyPowerLevelProps {
  deposits: Deposit[];
}

const TIERS = [
  {
    level: 1,
    label: "TIER I — BASE STRATEGY",
    multiplier: "2.0x",
    description: "Entry-level strategy engagement activated",
    color: "#FF8C00",
    glow: "#FF8C0040",
  },
  {
    level: 2,
    label: "TIER II — GROWTH STRATEGY",
    multiplier: "3.0x",
    description: "Multi-sector allocation unlocked",
    color: "#22C55E",
    glow: "#22C55E40",
  },
  {
    level: 3,
    label: "TIER III — MAX STRATEGY",
    multiplier: "1.0x",
    description: "Full RWA roadmap integration active",
    color: "#8B5CF6",
    glow: "#8B5CF640",
  },
];

function totalSPL(activeCount: number): string {
  if (activeCount === 0) return "0.0x";
  if (activeCount === 1) return "2.0x";
  if (activeCount === 2) return "5.0x";
  return "6.0x";
}

export default function StrategyPowerLevel({
  deposits,
}: StrategyPowerLevelProps) {
  const activeDeposits = deposits.filter((d) => d.status === "Verified");
  const activeCount = Math.min(activeDeposits.length, 3);

  return (
    <div className="cyber-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="card-heading text-[#FF8C00]">STRATEGY POWER LEVEL</h2>
        <div className="flex items-center gap-2">
          <div
            className="text-xs font-black tracking-widest px-3 py-1 rounded-full border"
            style={{
              color: activeCount === 0 ? "#6B7C8F" : "#FF8C00",
              borderColor: activeCount === 0 ? "#6B7C8F40" : "#FF8C0040",
              backgroundColor: activeCount === 0 ? "#0B0F14" : "#FF8C0010",
            }}
          >
            SPL {totalSPL(activeCount)}
          </div>
        </div>
      </div>

      {/* Tier cards */}
      <div className="flex flex-col gap-3 mb-4">
        {TIERS.map((tier) => {
          const isActive = activeCount >= tier.level;
          return (
            <div
              key={tier.level}
              className="flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-300"
              style={{
                borderColor: isActive ? `${tier.color}40` : "#ffffff10",
                backgroundColor: isActive ? `${tier.color}08` : "#0B0F14",
                boxShadow: isActive ? `0 0 12px ${tier.glow}` : "none",
              }}
            >
              {/* Indicator dot */}
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: isActive ? tier.color : "#2A3540",
                  boxShadow: isActive ? `0 0 6px ${tier.color}` : "none",
                }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-[10px] font-extrabold tracking-widest uppercase truncate"
                  style={{ color: isActive ? tier.color : "#4B5C6B" }}
                >
                  {tier.label}
                </div>
                <div
                  className="text-xs mt-0.5 truncate"
                  style={{ color: isActive ? "#93A4B7" : "#3A4B58" }}
                >
                  {isActive
                    ? tier.description
                    : "Awaiting strategy verification"}
                </div>
              </div>

              {/* Multiplier badge */}
              <div
                className="flex-shrink-0 text-sm font-black tabular-nums"
                style={{ color: isActive ? tier.color : "#2A3540" }}
              >
                {tier.multiplier}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total SPL summary */}
      <div className="rounded-xl border border-[#FF8C00]/15 bg-[#0B0F14] px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-extrabold tracking-widest uppercase text-[#93A4B7]">
            TOTAL STRATEGY POWER
          </div>
          <div className="text-xs text-[#6B7C8F] mt-0.5">
            {activeCount === 0
              ? "No verified strategies yet"
              : `${activeCount} of 3 tier${activeCount > 1 ? "s" : ""} active`}
          </div>
        </div>
        <div
          className="text-2xl font-black tabular-nums"
          style={{
            color: activeCount === 0 ? "#2A3540" : "#FF8C00",
            textShadow: activeCount > 0 ? "0 0 16px #FF8C0060" : "none",
          }}
        >
          {totalSPL(activeCount)}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-[#3A4B58] mt-3 leading-relaxed">
        Strategy multipliers activate upon Strategy Manager verification. Each
        tier unlocks when a deposit entry is approved in the Admin Command
        Center.
      </p>
    </div>
  );
}
