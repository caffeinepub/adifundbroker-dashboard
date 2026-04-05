import { Bell, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface TopNavProps {
  userPrincipal: string;
  onDeposit: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin?: boolean;
  onLogout: () => void;
}

const BASE_NAV_LINKS = [
  "DASHBOARD",
  "TERMINAL",
  "PORTFOLIO",
  "ACTIVITY",
  "WALLET",
];

export default function TopNav({
  userPrincipal,
  onDeposit,
  activeTab,
  onTabChange,
  isAdmin = false,
  onLogout,
}: TopNavProps) {
  const { clear } = useInternetIdentity();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const shortPrincipal = userPrincipal
    ? `${userPrincipal.slice(0, 6)}\u2026${userPrincipal.slice(-4)}`
    : "------";

  const navLinks = isAdmin ? [...BASE_NAV_LINKS, "ADMIN"] : BASE_NAV_LINKS;

  function handleLogout() {
    clear();
    onLogout();
  }

  function handleTabChange(tab: string) {
    onTabChange(tab);
    setMobileMenuOpen(false);
  }

  return (
    <>
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

        {/* Center Nav — desktop only */}
        <nav className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => (
            <button
              key={link}
              type="button"
              data-ocid={`nav.${link.toLowerCase()}.link`}
              onClick={() => handleTabChange(link)}
              className={`text-xs font-bold tracking-[0.14em] uppercase transition-colors duration-200 pb-1 border-b-2 ${
                activeTab === link
                  ? link === "ADMIN"
                    ? "text-red-400 border-red-400"
                    : "text-[#FF8C00] border-[#FF8C00]"
                  : link === "ADMIN"
                    ? "text-red-400/60 border-transparent hover:text-red-400"
                    : "text-[#93A4B7] border-transparent hover:text-[#E6EDF3]"
              }`}
            >
              {link === "ADMIN" ? "\u2699 ADMIN" : link}
            </button>
          ))}
        </nav>

        {/* Right: wallet + notification + logout + mobile hamburger */}
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
            className="hidden sm:flex items-center gap-2 border border-[#FF8C00]/50 rounded-full px-3 py-1.5 bg-[#0F1720]"
          >
            <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22C55E] flex-shrink-0" />
            <span className="text-xs font-mono text-[#E6EDF3] tracking-wide">
              {shortPrincipal}
            </span>
            {isAdmin && (
              <span className="text-[9px] font-extrabold tracking-widest uppercase text-red-400 border border-red-400/40 rounded px-1 py-0.5">
                ADMIN
              </span>
            )}
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

          {/* Notification bell — desktop */}
          <button
            type="button"
            aria-label="Notifications"
            className="hidden md:block relative text-[#93A4B7] hover:text-[#FF8C00] transition-colors"
          >
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF8C00] rounded-full flex items-center justify-center">
              <span className="text-[7px] font-bold text-black">3</span>
            </span>
          </button>

          {/* Logout button — desktop */}
          <button
            type="button"
            data-ocid="nav.logout.button"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
            className="hidden md:flex items-center gap-1.5 text-[#93A4B7] hover:text-red-400 transition-colors border border-transparent hover:border-red-400/30 rounded-lg px-2 py-1.5"
          >
            <LogOut size={15} />
            <span className="hidden lg:inline text-[10px] font-bold tracking-widest uppercase">
              LOGOUT
            </span>
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-[#FF8C00]/30 text-[#FF8C00] hover:bg-[#FF8C00]/10 transition-colors"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMobileMenuOpen(false)}
          role="presentation"
        />
      )}

      {/* Mobile drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 md:hidden flex flex-col bg-[#0B0F14] border-l border-[#FF8C00]/20 shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-[#FF8C00]/15">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22C55E]" />
            <span className="text-xs font-mono text-[#E6EDF3]">
              {shortPrincipal}
            </span>
            {isAdmin && (
              <span className="text-[9px] font-extrabold tracking-widest uppercase text-red-400 border border-red-400/40 rounded px-1 py-0.5">
                ADMIN
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#93A4B7] hover:text-[#E6EDF3] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {navLinks.map((link) => (
            <button
              key={link}
              type="button"
              onClick={() => handleTabChange(link)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold tracking-[0.12em] uppercase transition-all duration-200 ${
                activeTab === link
                  ? link === "ADMIN"
                    ? "bg-red-400/10 text-red-400 border border-red-400/30"
                    : "bg-[#FF8C00]/15 text-[#FF8C00] border border-[#FF8C00]/40"
                  : link === "ADMIN"
                    ? "text-red-400/60 border border-transparent hover:bg-red-400/10 hover:text-red-400"
                    : "text-[#93A4B7] border border-transparent hover:bg-[#FF8C00]/8 hover:text-[#E6EDF3]"
              }`}
            >
              {link === "ADMIN" ? "\u2699 ADMIN" : link}
            </button>
          ))}

          {/* Deposit button in drawer */}
          <button
            type="button"
            onClick={() => {
              onDeposit();
              setMobileMenuOpen(false);
            }}
            className="mt-2 w-full cyber-btn-primary py-3 text-sm font-bold tracking-widest uppercase rounded-xl"
          >
            + DEPOSIT
          </button>
        </nav>

        {/* Drawer footer: logout */}
        <div className="px-3 py-4 border-t border-[#FF8C00]/15">
          <button
            type="button"
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-[0.12em] uppercase text-[#93A4B7] hover:text-red-400 hover:bg-red-400/8 border border-transparent hover:border-red-400/20 transition-all duration-200"
          >
            <LogOut size={16} />
            LOGOUT
          </button>
        </div>
      </div>
    </>
  );
}
