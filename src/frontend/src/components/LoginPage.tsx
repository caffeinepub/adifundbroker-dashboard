import { motion } from "motion/react";
import { useState } from "react";

interface LoginPageProps {
  onLogin: (principal: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  function handleLogin() {
    setIsLoading(true);
    setTimeout(() => {
      const fakePrincipal = "2vxsx-fae";
      onLogin(fakePrincipal);
    }, 1500);
  }

  return (
    <div className="login-bg min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        {/* Perspective grid */}
        <div className="perspective-grid" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-auto px-6"
      >
        {/* Pulsing ring behind card */}
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
          {/* Logo / Wordmark */}
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

          {/* ICP Login Button */}
          <button
            type="button"
            data-ocid="login.primary_button"
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full cyber-btn-primary flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-sm font-bold tracking-[0.14em] uppercase transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                <span>AUTHENTICATING…</span>
              </>
            ) : (
              <>
                {/* ICP logo SVG */}
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
            ⚠ Educational prototype — simulated environment only.
            <br />
            No real transactions occur.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
