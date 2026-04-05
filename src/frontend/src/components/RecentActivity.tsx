import type { ActivityItem } from "../types";

const ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    type: "deposit",
    description: "Deposit received — £1,200 BTC",
    amount: "£1,200.00",
    timestamp: "2 hours ago",
    status: "success",
  },
  {
    id: "2",
    type: "earnings",
    description: "Daily earnings distributed",
    amount: "+£84.00",
    timestamp: "6 hours ago",
    status: "success",
  },
  {
    id: "3",
    type: "ai",
    description: "AI scan completed — 47 assets analysed",
    timestamp: "8 hours ago",
    status: "info",
  },
  {
    id: "4",
    type: "deposit",
    description: "Deposit received — £800 ICP",
    amount: "£800.00",
    timestamp: "12 hours ago",
    status: "success",
  },
  {
    id: "5",
    type: "rebalance",
    description: "Portfolio rebalanced",
    timestamp: "1 day ago",
    status: "info",
  },
  {
    id: "6",
    type: "earnings",
    description: "Weekly summary — total ROI 6%",
    amount: "+£588.00",
    timestamp: "1 day ago",
    status: "success",
  },
  {
    id: "7",
    type: "ai",
    description: "AI scan — BUY signal: SOL/USDT +2.11%",
    timestamp: "2 days ago",
    status: "info",
  },
  {
    id: "8",
    type: "deposit",
    description: "Deposit received — £500 EGLD",
    amount: "£500.00",
    timestamp: "3 days ago",
    status: "success",
  },
];

const TYPE_ICON_COLOR: Record<ActivityItem["type"], string> = {
  deposit: "#FF8C00",
  earnings: "#22C55E",
  ai: "#3B82F6",
  rebalance: "#8B5CF6",
};

const TYPE_ICON_LABEL: Record<ActivityItem["type"], string> = {
  deposit: "Deposit icon",
  earnings: "Earnings trend icon",
  ai: "AI lightning icon",
  rebalance: "Rebalance icon",
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

function EarningsIcon({ color }: { color: string }) {
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
      aria-label="Earnings trend icon"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
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

function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  const color = TYPE_ICON_COLOR[type];
  switch (type) {
    case "deposit":
      return <DepositIcon color={color} />;
    case "earnings":
      return <EarningsIcon color={color} />;
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

export default function RecentActivity() {
  return (
    <div className="cyber-card">
      <h2 className="card-heading text-[#FF8C00] mb-4">RECENT ACTIVITY</h2>
      <div className="flex flex-col gap-0.5">
        {ACTIVITIES.map((item, i) => (
          <div
            key={item.id}
            data-ocid={`activity.item.${i + 1}`}
            className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0"
            aria-label={TYPE_ICON_LABEL[item.type]}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(255,140,0,0.08)",
                border: "1px solid rgba(255,140,0,0.2)",
              }}
            >
              <ActivityIcon type={item.type} />
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
                <span className="text-xs font-mono font-bold text-[#22C55E]">
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
        ))}
      </div>
    </div>
  );
}
