import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { ScanResult } from "../types";

const INITIAL_SCANS: ScanResult[] = [
  { pair: "ICP/USDT", change: "+0.73%", direction: "up", signal: "BUY" },
  { pair: "BTC/USDT", change: "+1.24%", direction: "up", signal: "HOLD" },
  { pair: "ETH/USDT", change: "-0.41%", direction: "down", signal: "SELL" },
  { pair: "BNB/USDT", change: "+0.89%", direction: "up", signal: "BUY" },
  { pair: "SOL/USDT", change: "+2.11%", direction: "up", signal: "BUY" },
  { pair: "LINK/USDT", change: "-0.18%", direction: "down", signal: "SCAN" },
  { pair: "ADA/USDT", change: "+0.55%", direction: "up", signal: "BUY" },
  { pair: "AVAX/USDT", change: "+1.67%", direction: "up", signal: "BUY" },
];

const PAIRS = [
  "ICP/USDT",
  "BTC/USDT",
  "ETH/USDT",
  "BNB/USDT",
  "SOL/USDT",
  "LINK/USDT",
  "ADA/USDT",
  "AVAX/USDT",
  "DOT/USDT",
  "MATIC/USDT",
];

const SIGNALS: ScanResult["signal"][] = ["BUY", "SELL", "HOLD", "SCAN"];

function randFloat(min: number, max: number) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function generateScan(): ScanResult[] {
  return PAIRS.slice(0, 8).map((pair) => {
    const up = Math.random() > 0.35;
    const change = randFloat(0.05, 3.2);
    return {
      pair,
      change: `${up ? "+" : "-"}${change}%`,
      direction: up ? "up" : "down",
      signal: SIGNALS[Math.floor(Math.random() * SIGNALS.length)],
    };
  });
}

const BAR_CONFIG = [
  { delay: "0s", id: "bar-0" },
  { delay: "0.2s", id: "bar-1" },
  { delay: "0.4s", id: "bar-2" },
  { delay: "0.6s", id: "bar-3" },
  { delay: "0.8s", id: "bar-4" },
  { delay: "1.0s", id: "bar-5" },
];

const BLIPS = [
  { cx: 130, cy: 55, r: 2.5, id: "blip-0" },
  { cx: 75, cy: 140, r: 2, id: "blip-1" },
  { cx: 155, cy: 115, r: 3, id: "blip-2" },
  { cx: 60, cy: 80, r: 2, id: "blip-3" },
  { cx: 120, cy: 130, r: 2.5, id: "blip-4" },
];

const SIGNAL_COLORS: Record<ScanResult["signal"], string> = {
  BUY: "#22C55E",
  SELL: "#EF4444",
  HOLD: "#EAB308",
  SCAN: "#93A4B7",
};

export default function AiTradingPulse() {
  const [scans, setScans] = useState<ScanResult[]>(INITIAL_SCANS);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScans(generateScan());
      setTick((t) => t + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cyber-card h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="card-heading text-[#FF8C00]">AI TRADING PULSE</h2>
        <div className="flex items-center gap-2 border border-[#22C55E]/50 rounded-full px-3 py-1 bg-[#0B1A0E]">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-[#22C55E] uppercase">
            SYSTEM STATUS: ACTIVE
          </span>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left: animated data bars */}
        <div
          className="flex items-end gap-1.5 w-14 flex-shrink-0"
          aria-hidden="true"
        >
          {BAR_CONFIG.map((bar, i) => (
            <div
              key={bar.id}
              className="flex-1 rounded-t-sm animate-bar-bounce bg-gradient-to-t from-[#FF8C00] to-[#FF8C00]/40"
              style={{
                animationDelay: bar.delay,
                animationDuration: `${1.2 + i * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* Center: SVG Radar */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-52 h-52">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="AI trading radar scanner"
            >
              {/* Concentric rings */}
              {[90, 72, 54, 36, 18].map((r, i) => (
                <circle
                  key={r}
                  cx="100"
                  cy="100"
                  r={r}
                  fill="none"
                  stroke="#FF8C00"
                  strokeWidth="0.8"
                  opacity={0.15 + i * 0.08}
                />
              ))}

              {/* Grid lines */}
              <line
                x1="100"
                y1="10"
                x2="100"
                y2="190"
                stroke="#FF8C00"
                strokeWidth="0.5"
                opacity="0.25"
              />
              <line
                x1="10"
                y1="100"
                x2="190"
                y2="100"
                stroke="#FF8C00"
                strokeWidth="0.5"
                opacity="0.25"
              />
              <line
                x1="27"
                y1="27"
                x2="173"
                y2="173"
                stroke="#FF8C00"
                strokeWidth="0.4"
                opacity="0.15"
              />
              <line
                x1="173"
                y1="27"
                x2="27"
                y2="173"
                stroke="#FF8C00"
                strokeWidth="0.4"
                opacity="0.15"
              />

              {/* Rotating scan wedge */}
              <g
                className="animate-radar-spin"
                style={{ transformOrigin: "100px 100px" }}
              >
                <path
                  d="M100,100 L100,10 A90,90 0 0,1 163,37 Z"
                  fill="url(#scanGradient)"
                  opacity="0.7"
                />
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="10"
                  stroke="#FF8C00"
                  strokeWidth="1.5"
                  opacity="0.9"
                />
              </g>

              {/* Pulsing outer ring */}
              <circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="#FF8C00"
                strokeWidth="1"
                className="animate-pulse-ring"
                opacity="0.4"
              />

              {/* Scan blip dots */}
              {BLIPS.map((dot, i) => (
                <circle
                  key={dot.id}
                  cx={dot.cx}
                  cy={dot.cy}
                  r={dot.r}
                  fill="#22C55E"
                  opacity="0.85"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.4}s` }}
                />
              ))}

              {/* Center dot */}
              <circle cx="100" cy="100" r="4" fill="#FF8C00" opacity="0.95" />
              <circle
                cx="100"
                cy="100"
                r="8"
                fill="none"
                stroke="#FF8C00"
                strokeWidth="1"
                opacity="0.5"
              />

              <defs>
                <radialGradient id="scanGradient" cx="0%" cy="100%" r="100%">
                  <stop offset="0%" stopColor="#FF8C00" stopOpacity="0" />
                  <stop offset="60%" stopColor="#FF8C00" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.05" />
                </radialGradient>
              </defs>
            </svg>

            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-[9px] font-bold tracking-[0.2em] text-[#FF8C00] uppercase">
                  SCANNING
                </div>
                <div className="text-[8px] text-[#6B7C8F] tracking-widest">
                  {tick} cycles
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: live feed */}
        <div className="w-44 flex-shrink-0 flex flex-col gap-1 overflow-hidden">
          <div className="text-[9px] font-bold tracking-[0.2em] text-[#FF8C00] uppercase mb-2">
            AI PULSE SCANNING…
          </div>
          <AnimatePresence mode="popLayout">
            {scans.map((s) => (
              <motion.div
                key={`${s.pair}-${tick}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center justify-between text-[11px] py-0.5"
              >
                <span className="text-[#E6EDF3] font-mono w-20 truncate">
                  {s.pair}
                </span>
                <span
                  className={`font-mono ${
                    s.direction === "up" ? "text-[#22C55E]" : "text-[#EF4444]"
                  }`}
                >
                  {s.direction === "up" ? "↑" : "↓"} {s.change}
                </span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    color: SIGNAL_COLORS[s.signal],
                    background: `${SIGNAL_COLORS[s.signal]}18`,
                    border: `1px solid ${SIGNAL_COLORS[s.signal]}40`,
                  }}
                >
                  {s.signal}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
