import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { clearSessionParameter, getSecretParameter } from "../utils/urlParams";

interface LoginPageProps {
  onLogin: (principal: string, isAdmin: boolean) => void;
}

// Animated counter hook
function useCounter(target: number, duration = 1800, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = Date.now();
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress === 1 ? 1 : 1 - 2 ** (-10 * progress);
        setCount(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return count;
}

function StatsBar() {
  const strategies = useCounter(1247, 1800, 200);
  const users = useCounter(3892, 2000, 400);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-3xl mx-auto px-4 mb-6 hidden sm:block"
    >
      <div className="flex items-stretch divide-x divide-[#FF8C00]/15 bg-[#0F1720] border border-[#FF8C00]/20 rounded-xl overflow-hidden">
        <StatItem
          label="ACTIVE STRATEGIES"
          value={strategies.toLocaleString()}
          icon="⚡"
        />
        <StatItem label="TOTAL VOLUME" value="$48.3M" icon="💰" />
        <StatItem
          label="VERIFIED USERS"
          value={users.toLocaleString()}
          icon="🛡️"
        />
        <StatItem label="SUCCESS RATE" value="99.8%" icon="📈" />
      </div>
    </motion.div>
  );
}

function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-3 px-2 gap-0.5">
      <span className="text-base">{icon}</span>
      <span className="text-[#FF8C00] font-extrabold text-sm md:text-base font-mono tracking-tight">
        {value}
      </span>
      <span className="text-[#6B7C8F] text-[9px] md:text-[10px] tracking-[0.1em] uppercase font-semibold text-center">
        {label}
      </span>
    </div>
  );
}

function FeatureStrip() {
  const features = [
    {
      icon: "🔐",
      title: "Sovereign Identity",
      desc: "Authenticate via Internet Computer's decentralized identity protocol — no passwords, no custodians.",
    },
    {
      icon: "📊",
      title: "Strategy Engine",
      desc: "Multi-sector asset allocation powered by high-frequency analysis and RWA diversification.",
    },
    {
      icon: "🌐",
      title: "RWA Integration",
      desc: "Real World Asset diversification across global markets with transparent payout distribution.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="w-full max-w-3xl mx-auto px-4 mt-6 hidden sm:block"
    >
      <div className="grid grid-cols-3 gap-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.12 }}
            className="bg-[#0F1720] border border-[#FF8C00]/20 rounded-xl p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{f.icon}</span>
              <span className="text-[#FF8C00] font-bold text-xs tracking-[0.1em] uppercase">
                {f.title}
              </span>
            </div>
            <p className="text-[#6B7C8F] text-[11px] leading-relaxed">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function SystemStatusBanner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E13]/95 border-b border-[#FF8C00]/15 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-4 py-1.5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-green-400 text-[10px] font-bold tracking-[0.12em] uppercase">
            ALL SYSTEMS OPERATIONAL
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-[#6B7C8F] text-[9px] tracking-[0.08em] font-mono">
            GATEWAY v2.1.4
          </span>
          <span className="text-[#6B7C8F] text-[9px] tracking-[0.08em] font-mono">
            LATENCY: 12ms
          </span>
          <span className="text-[#6B7C8F] text-[9px] tracking-[0.08em] font-mono">
            UPTIME: 99.9%
          </span>
        </div>
        <div className="sm:hidden">
          <span className="text-[#6B7C8F] text-[9px] tracking-[0.08em] font-mono">
            v2.1.4 | 12ms
          </span>
        </div>
      </div>
    </motion.div>
  );
}

interface TickerEntry {
  id: string;
  pair: string;
  change: string;
  up: boolean;
}

const TICKER_ITEMS: TickerEntry[] = [
  { id: "icp", pair: "ICP/USD", change: "+4.2%", up: true },
  { id: "btc", pair: "BTC/USD", change: "+1.8%", up: true },
  { id: "eth", pair: "ETH/USD", change: "-0.3%", up: false },
  { id: "bnb", pair: "BNB/USD", change: "+2.1%", up: true },
  { id: "egld", pair: "EGLD/USD", change: "+5.7%", up: true },
  { id: "sol", pair: "SOL/USD", change: "+3.4%", up: true },
  { id: "matic", pair: "MATIC/USD", change: "-1.1%", up: false },
  { id: "avax", pair: "AVAX/USD", change: "+6.2%", up: true },
  { id: "dot", pair: "DOT/USD", change: "+0.9%", up: true },
  { id: "link", pair: "LINK/USD", change: "-0.5%", up: false },
  { id: "ada", pair: "ADA/USD", change: "+2.8%", up: true },
  { id: "xrp", pair: "XRP/USD", change: "+1.3%", up: true },
];

const TICKER_LOOP: TickerEntry[] = [
  ...TICKER_ITEMS.map((t) => ({ ...t, id: `a-${t.id}` })),
  ...TICKER_ITEMS.map((t) => ({ ...t, id: `b-${t.id}` })),
];

function TickerItem({ item }: { item: TickerEntry }) {
  return (
    <div className="flex items-center gap-1.5 px-5 whitespace-nowrap">
      <span className="text-[#93A4B7] text-[10px] font-mono font-semibold">
        {item.pair}
      </span>
      <span
        className={`text-[10px] font-mono font-bold ${
          item.up ? "text-green-400" : "text-red-400"
        }`}
      >
        {item.change} {item.up ? "▲" : "▼"}
      </span>
      <span className="text-[#FF8C00]/30 text-[8px]">●</span>
    </div>
  );
}

function MarketTicker() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0E13]/95 border-t border-[#FF8C00]/15 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center h-7">
        <div className="flex-shrink-0 bg-[#FF8C00] px-3 h-full flex items-center">
          <span className="text-black font-extrabold text-[9px] tracking-[0.15em] uppercase whitespace-nowrap">
            LIVE MARKET
          </span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="animate-ticker-scroll flex items-center gap-0">
            {TICKER_LOOP.map((item) => (
              <TickerItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { login, isLoggingIn, isInitializing, isLoginSuccess, identity } =
    useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();
  const [isRegistering, setIsRegistering] = useState(false);
  // Guard ref: ensures we only attempt the onLogin flow once per successful auth
  const loginHandledRef = useRef(false);
  const [hasAdminToken] = useState(() => {
    const token = getSecretParameter("caffeineAdminToken");
    return !!token;
  });

  useEffect(() => {
    // Trigger dashboard redirect when:
    // 1. identity is available (authenticated)
    // 2. isLoginSuccess is true (covers both fresh login AND restored sessions on page load)
    // 3. actor is ready
    // 4. not already handling this login
    if (
      !identity ||
      !isLoginSuccess ||
      !actor ||
      isActorFetching ||
      loginHandledRef.current
    ) {
      return;
    }

    loginHandledRef.current = true;
    setIsRegistering(true);

    const principal = identity.getPrincipal().toText();
    clearSessionParameter("caffeineAdminToken");

    actor
      .saveCallerUserProfile({ name: principal })
      .then(() => actor.isCallerAdmin())
      .then((adminStatus) => {
        onLogin(principal, adminStatus);
      })
      .catch((err) => {
        console.error("Registration/login failed:", err);
        onLogin(principal, false);
      })
      .finally(() => {
        setIsRegistering(false);
      });
  }, [identity, isLoginSuccess, actor, isActorFetching, onLogin]);

  // Show spinner only during actual user-triggered login or the backend registration call
  const isLoading = isLoggingIn || isRegistering;

  // Show loading state during initial app startup (before we know if user has a session)
  const isStartingUp = isInitializing || isActorFetching;

  return (
    <div className="login-bg min-h-screen flex flex-col relative overflow-hidden">
      <SystemStatusBanner />

      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="perspective-grid" />
      </div>

      <div className="flex flex-col items-center justify-center flex-1 pt-16 pb-12 px-4">
        <StatsBar />

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md mx-auto"
        >
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-hidden="true"
          >
            <div className="pulse-ring w-96 h-96 rounded-full border border-[#FF8C00]/20 animate-pulse-ring" />
            <div
              className="pulse-ring w-80 h-80 rounded-full border border-[#FF8C00]/30 animate-pulse-ring absolute"
              style={{ animationDelay: "0.5s" }}
            />
          </div>

          <div className="cyber-card p-10 flex flex-col items-center gap-6">
            <div className="flex items-center gap-3 mb-2">
              <svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                role="img"
                aria-label="Adifundbroker logo"
              >
                <polygon
                  points="18,2 34,10 34,26 18,34 2,26 2,10"
                  fill="none"
                  stroke="#FF8C00"
                  strokeWidth="2"
                />
                <polygon
                  points="18,8 28,13 28,23 18,28 8,23 8,13"
                  fill="rgba(255,140,0,0.12)"
                  stroke="#FF8C00"
                  strokeWidth="1"
                />
                <line
                  x1="18"
                  y1="2"
                  x2="18"
                  y2="34"
                  stroke="#FF8C00"
                  strokeWidth="0.5"
                  opacity="0.4"
                />
                <line
                  x1="2"
                  y1="18"
                  x2="34"
                  y2="18"
                  stroke="#FF8C00"
                  strokeWidth="0.5"
                  opacity="0.4"
                />
              </svg>
              <div>
                <span className="text-3xl font-extrabold tracking-[0.08em] uppercase text-[#FF8C00]">
                  ADIFUND
                </span>
                <span className="text-3xl font-extrabold tracking-[0.08em] uppercase text-white">
                  BROKER
                </span>
              </div>
            </div>

            <p className="text-[#93A4B7] text-sm tracking-[0.12em] uppercase text-center">
              Web3 Asset Management Protocol
            </p>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#FF8C00]/40 to-transparent" />

            {hasAdminToken && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-400/40 bg-red-400/5"
              >
                <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_#f87171] flex-shrink-0 animate-pulse" />
                <p className="text-[11px] text-red-300 font-bold tracking-wide leading-relaxed">
                  Admin access token detected. Authenticate below to enter the
                  Admin Command Center.
                </p>
              </motion.div>
            )}

            <button
              type="button"
              data-ocid="login.primary_button"
              onClick={login}
              disabled={isLoading || isStartingUp}
              className="w-full cyber-btn-primary flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-sm font-bold tracking-[0.14em] uppercase transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                  <span>CONNECTING&hellip;</span>
                </>
              ) : isStartingUp ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                  <span>LOADING&hellip;</span>
                </>
              ) : (
                <>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="Internet Computer Protocol logo"
                  >
                    <ellipse
                      cx="50"
                      cy="50"
                      rx="48"
                      ry="22"
                      stroke="black"
                      strokeWidth="6"
                      fill="none"
                    />
                    <ellipse
                      cx="50"
                      cy="50"
                      rx="48"
                      ry="22"
                      stroke="black"
                      strokeWidth="6"
                      fill="none"
                      transform="rotate(60 50 50)"
                    />
                    <ellipse
                      cx="50"
                      cy="50"
                      rx="48"
                      ry="22"
                      stroke="black"
                      strokeWidth="6"
                      fill="none"
                      transform="rotate(-60 50 50)"
                    />
                    <circle cx="50" cy="50" r="10" fill="black" />
                  </svg>
                  <span>Connect with Internet Identity</span>
                </>
              )}
            </button>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#FF8C00]/20 to-transparent" />

            <p className="text-[#6B7C8F] text-xs text-center tracking-wide">
              🔒 SECURE ACCESS: ADIFUND STRATEGY GATEWAY. Use your Sovereign
              Internet Identity (id.ai) to enter the high-conviction management
              environment. All strategy data and reward cycles are verified
              through the Institutional Command Center.
            </p>
          </div>
        </motion.div>

        <FeatureStrip />
      </div>

      <MarketTicker />
    </div>
  );
}
