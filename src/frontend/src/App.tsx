import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { toast } from "sonner";
import Dashboard from "./components/Dashboard";
import DepositModal from "./components/DepositModal";
import LoginPage from "./components/LoginPage";
import TopNav from "./components/TopNav";
import { useDeposits } from "./hooks/useDeposits";

const DEMO_PRINCIPAL = "2vxsx-fae-principal-demo";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPrincipal, setUserPrincipal] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("DASHBOARD");

  const {
    allDeposits,
    depositsInCycle,
    canDeposit,
    remainingSlots,
    daysUntilReset,
    addDeposit,
  } = useDeposits();

  function handleLogin(principal: string) {
    setUserPrincipal(principal || DEMO_PRINCIPAL);
    setIsLoggedIn(true);
  }

  function handleDeposit(asset: string, amount: number) {
    addDeposit(asset, amount);
    toast.success(`Deposit of £${amount} (${asset}) confirmed!`, {
      description: "Your funds are being processed.",
    });
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="dark">
      <Toaster theme="dark" position="top-right" />
      <TopNav
        userPrincipal={userPrincipal}
        onDeposit={() => setDepositOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <Dashboard
        deposits={allDeposits}
        onDeposit={() => setDepositOpen(true)}
      />
      <DepositModal
        isOpen={depositOpen}
        onClose={() => setDepositOpen(false)}
        onDeposit={handleDeposit}
        depositsUsed={depositsInCycle.length}
        canDeposit={canDeposit}
        remainingSlots={remainingSlots}
        daysUntilReset={daysUntilReset}
      />

      {/* Footer */}
      <footer className="border-t border-[#FF8C00]/15 py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#6B7C8F]">
        <div className="flex items-center gap-4">
          <span className="uppercase tracking-wide hover:text-[#93A4B7] cursor-pointer">
            About
          </span>
          <span className="uppercase tracking-wide hover:text-[#93A4B7] cursor-pointer">
            Terms
          </span>
          <span className="uppercase tracking-wide hover:text-[#93A4B7] cursor-pointer">
            Support
          </span>
        </div>
        <p className="text-center">
          © {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FF8C00] transition-colors"
          >
            Built with ❤ using caffeine.ai
          </a>
        </p>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_5px_#22C55E]" />
          <span className="uppercase tracking-widest font-bold text-[#22C55E] text-[10px]">
            OPERATIONAL
          </span>
        </div>
      </footer>
    </div>
  );
}
