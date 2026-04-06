import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { Deposit } from "../types";
import ActiveDeposits from "./ActiveDeposits";
import AiTradingPulse from "./AiTradingPulse";
import PortfolioOverview from "./PortfolioOverview";
import RecentActivity from "./RecentActivity";
import StrategyPowerLevel from "./StrategyPowerLevel";

interface DashboardProps {
  deposits: Deposit[];
  onDeposit: () => void;
  userPrincipal?: string;
}

function IdentityVaultCard({ principal }: { principal: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!principal) return;
    navigator.clipboard.writeText(principal).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (!principal) return null;

  return (
    <div className="cyber-card" data-ocid="dashboard.identity.card">
      {/* Card heading */}
      <div className="flex items-center gap-2 mb-3">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FF8C00"
          strokeWidth="2"
          strokeLinecap="round"
          role="img"
          aria-label="Identity icon"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span className="text-[9px] font-extrabold tracking-[0.22em] uppercase text-[#6B7C8F]">
          IDENTITY VAULT
        </span>
      </div>

      <h3 className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#FF8C00] mb-3">
        MY ICP PRINCIPAL ID
      </h3>

      {/* Principal + copy */}
      <div className="flex items-start gap-3 bg-[#0B0F14] rounded-xl px-4 py-3 border border-[#FF8C00]/20">
        <p
          className="flex-1 font-mono text-[11px] text-[#E6EDF3] break-all leading-relaxed select-all"
          data-ocid="dashboard.identity.input"
        >
          {principal}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          data-ocid="dashboard.identity.button"
          aria-label={copied ? "Copied!" : "Copy principal ID"}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-widest uppercase transition-all duration-200 ${
            copied
              ? "bg-green-500/20 text-green-400 border border-green-500/40"
              : "border border-[#FF8C00]/40 text-[#FF8C00] hover:bg-[#FF8C00]/10"
          }`}
        >
          {copied ? (
            <>
              <Check size={11} />
              COPIED!
            </>
          ) : (
            <>
              <Copy size={11} />
              COPY
            </>
          )}
        </button>
      </div>

      {/* Info line */}
      <p className="mt-2.5 text-[10px] text-[#6B7C8F] leading-relaxed">
        Share this ID with the admin to get your account hardcoded as permanent
        admin.
      </p>
    </div>
  );
}

export default function Dashboard({
  deposits,
  onDeposit,
  userPrincipal,
}: DashboardProps) {
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ActiveDeposits deposits={deposits} onDeposit={onDeposit} />
        <StrategyPowerLevel deposits={deposits} />
      </div>

      {/* Row 3: Identity Vault */}
      {userPrincipal && <IdentityVaultCard principal={userPrincipal} />}
    </main>
  );
}
