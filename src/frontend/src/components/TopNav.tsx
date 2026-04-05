import { Bell } from "lucide-react";

interface TopNavProps {
  userPrincipal: string;
  onDeposit: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAV_LINKS = ["DASHBOARD", "TERMINAL", "PORTFOLIO", "ACTIVITY"];

export default function TopNav({
  userPrincipal,
  onDeposit,
  activeTab,
  onTabChange,
}: TopNavProps) {
  const shortPrincipal = `${userPrincipal.slice(0, 6)}…${userPrincipal.slice(-4)}`;

  return (
    <header className="top-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <svg
          width="28"
          height="28"
          viewBox="0 0 36 36"
          fill="none"
          className="flex-shrink-0"
          role="img"
          aria-label="Adifundbroker brand icon"
        >
          <polygon
            points="18,2 34,10 34,26 18,34 2,26 2,10"
            fill="none"
            stroke="#FF8C00"
            strokeWidth="2"
          />
          <polygon
            points="18,8 28,13 28,23 18,28 8,23 8,13"
            fill="rgba(255,140,0,0.15)"
            stroke="#FF8C00"
            strokeWidth="1"
          />
        </svg>
        <span className="text-lg font-extrabold tracking-[0.08em] text-[#FF8C00] uppercase">
          ADIFUND
        </span>
        <span className="text-lg font-extrabold tracking-[0.08em] text-white uppercase">
          BROKER
        </span>
      </div>

      {/* Center Nav */}
      <nav className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <button
            key={link}
            type="button"
            data-ocid={`nav.${link.toLowerCase()}.link`}
            onClick={() => onTabChange(link)}
            className={`text-xs font-bold tracking-[0.14em] uppercase transition-colors duration-200 pb-1 border-b-2 ${
              activeTab === link
                ? "text-[#FF8C00] border-[#FF8C00]"
                : "text-[#93A4B7] border-transparent hover:text-[#E6EDF3]"
            }`}
          >
            {link}
          </button>
        ))}
      </nav>

      {/* Right: wallet + notification */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-ocid="nav.deposit.primary_button"
          onClick={onDeposit}
          className="hidden lg:flex cyber-btn-primary text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-lg"
        >
          + DEPOSIT
        </button>

        {/* Wallet capsule */}
        <div
          data-ocid="nav.wallet.panel"
          className="flex items-center gap-2 border border-[#FF8C00]/50 rounded-full px-3 py-1.5 bg-[#0F1720]"
        >
          <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22C55E] flex-shrink-0" />
          <span className="text-xs font-mono text-[#E6EDF3] tracking-wide">
            {shortPrincipal}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF8C00"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label="Wallet icon"
          >
            <rect x="1" y="6" width="22" height="15" rx="2" />
            <path d="M1 10h22" />
            <circle cx="17" cy="15" r="1.5" fill="#FF8C00" stroke="none" />
          </svg>
        </div>

        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-[#93A4B7] hover:text-[#FF8C00] transition-colors"
        >
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF8C00] rounded-full flex items-center justify-center">
            <span className="text-[7px] font-bold text-black">3</span>
          </span>
        </button>
      </div>
    </header>
  );
}
