import { useCallback, useEffect, useRef, useState } from "react";
import type { ActivityItem } from "../types";

// ─── Activity generators ─────────────────────────────────────────────────────

const DEPOSIT_ASSETS = ["BTC", "ICP", "BNB", "EGLD", "BCH"];
const WITHDRAWAL_ASSETS = ["BTC", "ICP", "BNB", "EGLD"];
const DEPOSIT_AMOUNTS = [
  200, 250, 300, 400, 500, 750, 800, 1000, 1200, 1500, 2000, 2500, 3000,
];
const WITHDRAWAL_AMOUNTS = [100, 150, 200, 250, 300, 400, 500, 600];
const AI_SIGNALS = [
  "BUY signal: BTC/USDT +1.87%",
  "BUY signal: SOL/USDT +2.11%",
  "BUY signal: ICP/USDT +3.44%",
  "SELL signal: ETH/USDT -0.92%",
  "BUY signal: BNB/USDT +1.65%",
  "Market scan — 47 assets analysed",
  "Market scan — 63 assets analysed",
  "High-frequency pattern detected: EGLD",
  "RWA correlation index updated",
  "Multi-sector rebalance signal issued",
];
const REBALANCE_MSGS = [
  "Portfolio rebalanced — sector rotation",
  "Strategy allocation adjusted",
  "RWA weighting updated",
  "Risk profile recalibrated",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatAge(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

let _idCounter = 100;
function nextId() {
  return String(++_idCounter);
}

function generateActivity(ts: number): ActivityItem & { createdAt: number } {
  // Weighted: deposits 50%, withdrawals 20%, ai 20%, rebalance 10%
  const roll = Math.random();
  if (roll < 0.5) {
    const asset = rand(DEPOSIT_ASSETS);
    const amount = rand(DEPOSIT_AMOUNTS);
    return {
      id: nextId(),
      type: "deposit",
      description: `Deposit received — $${amount.toLocaleString()} ${asset}`,
      amount: `$${amount.toLocaleString()}.00`,
      timestamp: "just now",
      status: "success",
      createdAt: ts,
    };
  }
  if (roll < 0.7) {
    const asset = rand(WITHDRAWAL_ASSETS);
    const amount = rand(WITHDRAWAL_AMOUNTS);
    return {
      id: nextId(),
      type: "earnings",
      description: `Withdrawal processed — $${amount.toLocaleString()} ${asset}`,
      amount: `-$${amount.toLocaleString()}.00`,
      timestamp: "just now",
      status: "success",
      createdAt: ts,
    };
  }
  if (roll < 0.9) {
    return {
      id: nextId(),
      type: "ai",
      description: `AI scan — ${rand(AI_SIGNALS)}`,
      timestamp: "just now",
      status: "info",
      createdAt: ts,
    };
  }
  return {
    id: nextId(),
    type: "rebalance",
    description: rand(REBALANCE_MSGS),
    timestamp: "just now",
    status: "info",
    createdAt: ts,
  };
}

// ─── Seed list (shown on first load) ─────────────────────────────────────────

const SEED_TS = Date.now();
const SEED_ACTIVITIES: Array<ActivityItem & { createdAt: number }> = [
  {
    id: "s1",
    type: "deposit",
    description: "Deposit received — $1,200 BTC",
    amount: "$1,200.00",
    timestamp: "2h ago",
    status: "success",
    createdAt: SEED_TS - 7_200_000,
  },
  {
    id: "s2",
    type: "earnings",
    description: "Withdrawal processed — $250 ICP",
    amount: "-$250.00",
    timestamp: "4h ago",
    status: "success",
    createdAt: SEED_TS - 14_400_000,
  },
  {
    id: "s3",
    type: "ai",
    description: "AI scan — BUY signal: BTC/USDT +1.87%",
    timestamp: "6h ago",
    status: "info",
    createdAt: SEED_TS - 21_600_000,
  },
  {
    id: "s4",
    type: "deposit",
    description: "Deposit received — $800 ICP",
    amount: "$800.00",
    timestamp: "8h ago",
    status: "success",
    createdAt: SEED_TS - 28_800_000,
  },
  {
    id: "s5",
    type: "rebalance",
    description: "Portfolio rebalanced — sector rotation",
    timestamp: "10h ago",
    status: "info",
    createdAt: SEED_TS - 36_000_000,
  },
  {
    id: "s6",
    type: "deposit",
    description: "Deposit received — $500 EGLD",
    amount: "$500.00",
    timestamp: "12h ago",
    status: "success",
    createdAt: SEED_TS - 43_200_000,
  },
  {
    id: "s7",
    type: "ai",
    description: "AI scan — 63 assets analysed",
    timestamp: "1d ago",
    status: "info",
    createdAt: SEED_TS - 86_400_000,
  },
  {
    id: "s8",
    type: "earnings",
    description: "Withdrawal processed — $400 BNB",
    amount: "-$400.00",
    timestamp: "1d ago",
    status: "success",
    createdAt: SEED_TS - 90_000_000,
  },
];

// ─── Icon components ──────────────────────────────────────────────────────────

const TYPE_ICON_COLOR: Record<ActivityItem["type"], string> = {
  deposit: "#FF8C00",
  earnings: "#22C55E",
  ai: "#3B82F6",
  rebalance: "#8B5CF6",
};

function DepositIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Deposit icon"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

function WithdrawalIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Withdrawal icon"
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function AiIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="AI lightning icon"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function RebalanceIcon({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Rebalance icon"
    >
      <polyline points="1 4 1 10 7 10" />
      <polyline points="23 20 23 14 17 14" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  );
}

function ActivityIcon({
  type,
  isWithdrawal,
}: { type: ActivityItem["type"]; isWithdrawal?: boolean }) {
  const color = TYPE_ICON_COLOR[type];
  if (type === "earnings" && isWithdrawal)
    return <WithdrawalIcon color="#EF4444" />;
  switch (type) {
    case "deposit":
      return <DepositIcon color={color} />;
    case "earnings":
      return <WithdrawalIcon color={color} />;
    case "ai":
      return <AiIcon color={color} />;
    case "rebalance":
      return <RebalanceIcon color={color} />;
    default:
      return <DepositIcon color={color} />;
  }
}

const STATUS_BADGE: Record<
  ActivityItem["status"],
  { label: string; color: string }
> = {
  success: { label: "OK", color: "#22C55E" },
  pending: { label: "PENDING", color: "#EAB308" },
  info: { label: "INFO", color: "#3B82F6" },
};

// ─── Main component ───────────────────────────────────────────────────────────

const MAX_ITEMS = 12;

export default function RecentActivity() {
  const [items, setItems] = useState<
    Array<ActivityItem & { createdAt: number }>
  >(() => SEED_ACTIVITIES);
  const tickRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bump every 30 s to refresh relative timestamps
  const [, setTimerTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTimerTick((t) => t + 1), 30_000);
    return () => clearInterval(iv);
  }, []);

  const scheduleNext = useCallback(() => {
    const delay = randInt(45_000, 75_000);
    tickRef.current = setTimeout(() => {
      const newItem = generateActivity(Date.now());
      setItems((prev) => [newItem, ...prev].slice(0, MAX_ITEMS));
      scheduleNext();
    }, delay);
  }, []);

  useEffect(() => {
    scheduleNext();
    return () => {
      if (tickRef.current) clearTimeout(tickRef.current);
    };
  }, [scheduleNext]);

  const now = Date.now();
  const liveItems = items.map((item) => ({
    ...item,
    timestamp:
      item.createdAt > now - 10_000
        ? "just now"
        : formatAge(Math.floor((now - item.createdAt) / 1000)),
  }));

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="card-heading text-[#FF8C00]">RECENT ACTIVITY</h2>
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
          </span>
          <span className="text-[9px] font-bold tracking-[0.12em] uppercase text-green-400">
            LIVE
          </span>
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        {liveItems.map((item, i) => {
          const isWithdrawal =
            item.type === "earnings" &&
            item.description.startsWith("Withdrawal");
          const amountColor = isWithdrawal ? "#EF4444" : "#22C55E";
          return (
            <div
              key={item.id}
              data-ocid={`activity.item.${i + 1}`}
              className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 transition-all duration-300"
              aria-label={item.description}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: isWithdrawal
                    ? "rgba(239,68,68,0.08)"
                    : "rgba(255,140,0,0.08)",
                  border: isWithdrawal
                    ? "1px solid rgba(239,68,68,0.2)"
                    : "1px solid rgba(255,140,0,0.2)",
                }}
              >
                <ActivityIcon type={item.type} isWithdrawal={isWithdrawal} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#E6EDF3] truncate">
                  {item.description}
                </div>
                <div className="text-[10px] text-[#6B7C8F] mt-0.5">
                  {item.timestamp}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.amount && (
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: amountColor }}
                  >
                    {item.amount}
                  </span>
                )}
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    color: STATUS_BADGE[item.status].color,
                    background: `${STATUS_BADGE[item.status].color}15`,
                    border: `1px solid ${STATUS_BADGE[item.status].color}35`,
                  }}
                >
                  {STATUS_BADGE[item.status].label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
