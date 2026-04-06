import { Bell, LogOut, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FullNotification, backendInterface } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface TopNavProps {
  userPrincipal: string;
  onDeposit: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin?: boolean;
  onLogout: () => void;
  actor?: backendInterface | null;
}

const BASE_NAV_LINKS = ["DASHBOARD", "WALLET"];

function formatRelativeTime(timestampNs: bigint): string {
  const ms = Number(timestampNs) / 1_000_000;
  const diff = Date.now() - ms;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(ms).toLocaleDateString("en-GB");
}

interface NotificationBellProps {
  actor?: backendInterface | null;
  variant?: "desktop" | "mobile";
}

function NotificationBell({
  actor,
  variant = "desktop",
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<FullNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCount = useCallback(async () => {
    if (!actor) return;
    try {
      const count = await actor.getUnreadNotificationCount();
      setUnreadCount(Number(count));
    } catch {
      // silently ignore
    }
  }, [actor]);

  const fetchNotifications = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const list = await actor.getMyNotifications();
      // newest first
      const sorted = [...list].sort((a, b) =>
        Number(b.timestamp - a.timestamp),
      );
      setNotifications(sorted);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (actor) fetchCount();
  }, [actor, fetchCount]);

  useEffect(() => {
    if (open && actor) {
      fetchNotifications();
    }
  }, [open, actor, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleMarkRead(id: bigint) {
    if (!actor) return;
    try {
      await actor.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently ignore
    }
  }

  async function handleMarkAllRead() {
    if (!actor) return;
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;
    setMarkingAll(true);
    try {
      await Promise.all(unread.map((n) => actor.markNotificationRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently ignore
    } finally {
      setMarkingAll(false);
    }
  }

  const buttonBase =
    variant === "desktop"
      ? "hidden md:block relative text-[#93A4B7] hover:text-[#FF8C00] transition-colors"
      : "relative text-[#93A4B7] hover:text-[#FF8C00] transition-colors";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        data-ocid="nav.notification.toggle"
        onClick={() => setOpen((v) => !v)}
        className={buttonBase}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-[#FF8C00] rounded-full flex items-center justify-center px-0.5">
            <span className="text-[7px] font-bold text-black leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-8 w-80 rounded-xl border border-[#FF8C00]/30 bg-[#0F1720] shadow-2xl shadow-black/60 z-50 overflow-hidden"
          data-ocid="nav.notification.popover"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#FF8C00]/15">
            <span className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#FF8C00]">
              NOTIFICATIONS
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="text-[9px] font-bold tracking-widest uppercase text-[#93A4B7] hover:text-[#FF8C00] transition-colors disabled:opacity-50"
              >
                {markingAll ? "MARKING…" : "MARK ALL READ"}
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-[#FF8C00]/30 border-t-[#FF8C00] rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-10 gap-2"
                data-ocid="nav.notification.empty_state"
              >
                <Bell size={22} className="text-[#3A4A5C]" />
                <p className="text-xs text-[#6B7C8F]">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <button
                    key={n.id.toString()}
                    type="button"
                    onClick={() => !n.isRead && handleMarkRead(n.id)}
                    disabled={n.isRead}
                    className={`w-full flex gap-3 px-4 py-3 text-left transition-colors disabled:cursor-default ${
                      n.isRead
                        ? "hover:bg-white/3"
                        : "bg-[#FF8C00]/4 hover:bg-[#FF8C00]/8 border-l-2 border-[#FF8C00]/70"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs leading-relaxed break-words ${
                          n.isRead ? "text-[#93A4B7]" : "text-[#E6EDF3]"
                        }`}
                      >
                        {n.message}
                      </p>
                      <p className="text-[10px] text-[#6B7C8F] mt-1">
                        {formatRelativeTime(n.timestamp)}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span className="flex-shrink-0 mt-1 w-2 h-2 rounded-full bg-[#FF8C00] shadow-[0_0_5px_#FF8C00]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TopNav({
  userPrincipal,
  onDeposit,
  activeTab,
  onTabChange,
  isAdmin = false,
  onLogout,
  actor,
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
          <NotificationBell actor={actor} variant="desktop" />

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

          {/* Notification bell in mobile drawer */}
          <div className="mt-2 px-4 py-3 rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold tracking-[0.12em] uppercase text-[#93A4B7]">
              NOTIFICATIONS
            </span>
            <NotificationBell actor={actor} variant="mobile" />
          </div>

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
