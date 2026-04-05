import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { toast } from "sonner";
import AdminPanel from "./components/AdminPanel";
import Dashboard from "./components/Dashboard";
import DepositModal from "./components/DepositModal";
import InfoModal from "./components/InfoModal";
import LoginPage from "./components/LoginPage";
import TopNav from "./components/TopNav";
import WalletTab from "./components/WalletTab";
import { useActor } from "./hooks/useActor";
import { useDeposits } from "./hooks/useDeposits";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPrincipal, setUserPrincipal] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("DASHBOARD");
  const [infoPage, setInfoPage] = useState<
    "about" | "terms" | "support" | "faq" | null
  >(null);

  const { actor } = useActor();

  // useDeposits now always fetches only the logged-in user's own deposits
  const {
    deposits,
    depositsInCycle,
    canDeposit,
    remainingSlots,
    daysUntilReset,
    addDeposit,
    refreshDeposits,
  } = useDeposits(actor);

  function handleLogin(principal: string, adminStatus: boolean) {
    setUserPrincipal(principal);
    setIsAdmin(adminStatus);
    setIsLoggedIn(true);
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setUserPrincipal("");
    setIsAdmin(false);
    setActiveTab("DASHBOARD");
    setDepositOpen(false);
    toast.success("Logged out successfully.");
  }

  async function handleDeposit(
    asset: string,
    amount: number,
    txid?: string,
    screenshotBlobId?: string,
  ) {
    await addDeposit(asset, amount, txid, screenshotBlobId);
    toast.success(`Deposit of \u00a3${amount} (${asset}) submitted!`, {
      description: "Awaiting manager verification.",
    });
    await refreshDeposits();
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
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      <div className="dashboard-bg min-h-screen pt-16">
        {activeTab === "WALLET" && <WalletTab deposits={deposits} />}
        {activeTab === "ADMIN" && isAdmin && actor && (
          <AdminPanel actor={actor} />
        )}
        {activeTab !== "WALLET" && activeTab !== "ADMIN" && (
          <Dashboard
            deposits={deposits}
            onDeposit={() => setDepositOpen(true)}
          />
        )}
      </div>

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
          <button
            type="button"
            data-ocid="footer.about.button"
            onClick={() => setInfoPage("about")}
            className="uppercase tracking-wide hover:text-[#93A4B7] cursor-pointer transition-colors"
          >
            About
          </button>
          <button
            type="button"
            data-ocid="footer.terms.button"
            onClick={() => setInfoPage("terms")}
            className="uppercase tracking-wide hover:text-[#93A4B7] cursor-pointer transition-colors"
          >
            Terms
          </button>
          <button
            type="button"
            data-ocid="footer.faq.button"
            onClick={() => setInfoPage("faq")}
            className="uppercase tracking-wide hover:text-[#93A4B7] cursor-pointer transition-colors"
          >
            FAQ
          </button>
          <button
            type="button"
            data-ocid="footer.support.button"
            onClick={() => setInfoPage("support")}
            className="uppercase tracking-wide hover:text-[#93A4B7] cursor-pointer transition-colors"
          >
            Support
          </button>
        </div>
        <p className="text-center">
          \u00a9 {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FF8C00] transition-colors"
          >
            Built with \u2764 using caffeine.ai
          </a>
        </p>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_5px_#22C55E]" />
          <span className="uppercase tracking-widest font-bold text-[#22C55E] text-[10px]">
            OPERATIONAL
          </span>
        </div>
      </footer>

      <InfoModal
        page={infoPage}
        onClose={() => setInfoPage(null)}
        actor={actor ?? undefined}
      />
    </div>
  );
}
