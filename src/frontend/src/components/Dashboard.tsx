import type { Deposit } from "../types";
import ActiveDeposits from "./ActiveDeposits";
import AiTradingPulse from "./AiTradingPulse";
import PortfolioOverview from "./PortfolioOverview";
import RecentActivity from "./RecentActivity";
import StrategyPowerLevel from "./StrategyPowerLevel";

interface DashboardProps {
  deposits: Deposit[];
  onDeposit: () => void;
}

export default function Dashboard({ deposits, onDeposit }: DashboardProps) {
  return (
    <main className="dashboard-bg min-h-screen pt-20 pb-10 px-4 lg:px-6">
      {/* Row 1: Portfolio + Activity | AI Pulse Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Left column: Portfolio + Activity */}
        <div className="flex flex-col gap-4">
          <PortfolioOverview deposits={deposits} />
          <RecentActivity />
        </div>

        {/* Center-right: AI Trading Pulse Hero */}
        <div className="lg:col-span-2">
          <AiTradingPulse />
        </div>
      </div>

      {/* Row 2: Active Deposits | Strategy Power Level */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActiveDeposits deposits={deposits} onDeposit={onDeposit} />
        <StrategyPowerLevel deposits={deposits} />
      </div>
    </main>
  );
}
