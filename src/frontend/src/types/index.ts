export interface Deposit {
  id: string;
  asset: string;
  amount: number;
  timestamp: number;
  status: "Pending" | "Verified" | "Rejected";
  txid?: string;
  screenshotName?: string;
  screenshotBlobId?: string;
  userPrincipal?: string;
}

export interface AssetConfig {
  symbol: string;
  name: string;
  address: string;
  color: string;
}

export interface ScanResult {
  pair: string;
  change: string;
  direction: "up" | "down";
  signal: "BUY" | "SELL" | "HOLD" | "SCAN";
}

export interface ActivityItem {
  id: string;
  type: "deposit" | "earnings" | "ai" | "rebalance";
  description: string;
  amount?: string;
  timestamp: string;
  status: "success" | "pending" | "info";
}

export const ROI_RATES = [0.02, 0.03, 0.01] as const; // per deposit slot
export const DEPOSIT_LIMIT = 3;
export const CYCLE_DAYS = 30;
