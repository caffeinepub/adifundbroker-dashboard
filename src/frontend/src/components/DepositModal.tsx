import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (asset: string, amount: number) => void;
  depositsUsed: number;
  canDeposit: boolean;
  remainingSlots: number;
  daysUntilReset: number;
}

const ASSETS = [
  {
    symbol: "ICP",
    name: "Internet Computer",
    address: "ad29a2c5e77b204e49f345ef00acb643680712ec48cf32010dd74c2cc202635b",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    address: "188LdmcrRoEFj77vHDbiUHPdaTPvvDDwfP",
  },
  {
    symbol: "BCH",
    name: "Bitcoin Cash",
    address: "0xecbe9e5812585833771705ba2455aaae1a54cf02",
  },
  {
    symbol: "BNB",
    name: "BNB Chain",
    address: "0xecbe9e5812585833771705ba2455aaae1a54cf02",
  },
  {
    symbol: "EGLD",
    name: "MultiversX",
    address: "erd1894lw649t9gq6vn0hugfzj670gqezsezrdtdahlgg23mqglpcyaszep6rv",
  },
];

export default function DepositModal({
  isOpen,
  onClose,
  onDeposit,
  depositsUsed,
  canDeposit,
  remainingSlots,
  daysUntilReset,
}: DepositModalProps) {
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0].symbol);
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [success, setSuccess] = useState(false);

  const asset = ASSETS.find((a) => a.symbol === selectedAsset) ?? ASSETS[0];
  const numAmount = Number(amount);
  const amountValid = amount !== "" && numAmount >= 200 && numAmount <= 5000;

  function validateAmount(val: string) {
    const n = Number(val);
    if (val === "") {
      setAmountError("");
    } else if (Number.isNaN(n) || n < 200) {
      setAmountError("Minimum deposit is £200");
    } else if (n > 5000) {
      setAmountError("Maximum deposit is £5,000");
    } else {
      setAmountError("");
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(asset.address).catch(() => {
      const el = document.createElement("textarea");
      el.value = asset.address;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleConfirm() {
    if (!amountValid || !canDeposit) return;
    onDeposit(selectedAsset, numAmount);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setAmount("");
      setAmountError("");
      onClose();
    }, 1800);
  }

  function handleClose() {
    setSuccess(false);
    setAmount("");
    setAmountError("");
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm cursor-pointer"
            onClick={handleClose}
            onKeyDown={(e) => e.key === "Escape" && handleClose()}
            tabIndex={0}
            aria-label="Close modal"
            data-ocid="deposit.modal"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
          >
            <section
              className="cyber-card w-full max-w-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              aria-labelledby="deposit-modal-title"
            >
              {success ? (
                <div
                  data-ocid="deposit.success_state"
                  className="flex flex-col items-center justify-center py-12 gap-4"
                >
                  <div
                    className="w-16 h-16 rounded-full border-2 border-[#22C55E] flex items-center justify-center"
                    style={{ boxShadow: "0 0 24px rgba(34,197,94,0.4)" }}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      role="img"
                      aria-label="Deposit confirmed checkmark"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-extrabold tracking-widest text-[#22C55E] uppercase">
                      DEPOSIT CONFIRMED
                    </p>
                    <p className="text-xs text-[#6B7C8F] mt-1">
                      Your deposit is being processed.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2
                      id="deposit-modal-title"
                      className="card-heading text-[#FF8C00]"
                    >
                      5-PILLAR DEPOSIT GATEWAY
                    </h2>
                    <button
                      type="button"
                      data-ocid="deposit.close_button"
                      onClick={handleClose}
                      className="text-[#6B7C8F] hover:text-[#E6EDF3] transition-colors"
                      aria-label="Close deposit modal"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        role="img"
                        aria-label="Close"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {/* Cycle status */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase mb-2">
                      <span className="text-[#93A4B7]">
                        DEPOSIT CYCLE USAGE
                      </span>
                      <span
                        className={
                          canDeposit ? "text-[#22C55E]" : "text-[#EF4444]"
                        }
                      >
                        {depositsUsed} / 3 USED
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#0B0F14] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(depositsUsed / 3) * 100}%`,
                          background:
                            depositsUsed >= 3
                              ? "#EF4444"
                              : "linear-gradient(90deg, #FF8C00, #FFAA40)",
                          boxShadow:
                            depositsUsed >= 3
                              ? "0 0 8px #EF444480"
                              : "0 0 8px rgba(255,140,0,0.5)",
                        }}
                      />
                    </div>
                  </div>

                  {!canDeposit ? (
                    <div
                      data-ocid="deposit.error_state"
                      className="bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl p-4 text-center mb-4"
                    >
                      <p className="text-[#EF4444] font-bold text-sm tracking-wide">
                        MONTHLY DEPOSIT LIMIT REACHED (3/3)
                      </p>
                      <p className="text-[#6B7C8F] text-xs mt-1">
                        Resets in{" "}
                        <span className="text-[#E6EDF3] font-bold">
                          {daysUntilReset} days
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {/* Asset selector */}
                      <div>
                        <label
                          htmlFor="asset-select"
                          className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#93A4B7] block mb-2"
                        >
                          SELECT ASSET
                        </label>
                        <select
                          id="asset-select"
                          data-ocid="deposit.asset.select"
                          value={selectedAsset}
                          onChange={(e) => setSelectedAsset(e.target.value)}
                          className="w-full bg-[#0B0F14] border border-[#FF8C00]/30 rounded-xl px-4 py-3 text-sm font-bold text-[#E6EDF3] tracking-wide focus:outline-none focus:border-[#FF8C00]/70 appearance-none cursor-pointer"
                        >
                          {ASSETS.map((a) => (
                            <option
                              key={a.symbol}
                              value={a.symbol}
                              className="bg-[#0F1720]"
                            >
                              {a.symbol} — {a.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Wallet address */}
                      <div>
                        <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#93A4B7] block mb-2">
                          DEPOSIT ADDRESS ({asset.symbol})
                        </p>
                        <div className="flex items-center gap-2 bg-[#0B0F14] border border-white/10 rounded-xl px-3 py-2.5">
                          <code className="flex-1 text-[11px] font-mono text-[#93A4B7] break-all leading-relaxed">
                            {asset.address}
                          </code>
                          <button
                            type="button"
                            data-ocid="deposit.copy.button"
                            onClick={handleCopy}
                            className="flex-shrink-0 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg transition-all duration-200 border"
                            style={{
                              color: copied ? "#22C55E" : "#FF8C00",
                              borderColor: copied ? "#22C55E" : "#FF8C00",
                              background: copied
                                ? "rgba(34,197,94,0.1)"
                                : "rgba(255,140,0,0.1)",
                            }}
                          >
                            {copied ? "COPIED!" : "COPY"}
                          </button>
                        </div>
                      </div>

                      {/* Amount input */}
                      <div>
                        <label
                          htmlFor="deposit-amount"
                          className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#93A4B7] block mb-2"
                        >
                          AMOUNT (£200 – £5,000)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#93A4B7] text-sm font-bold">
                            £
                          </span>
                          <input
                            id="deposit-amount"
                            data-ocid="deposit.amount.input"
                            type="number"
                            min={200}
                            max={5000}
                            placeholder="200 – 5000"
                            value={amount}
                            onChange={(e) => {
                              setAmount(e.target.value);
                              validateAmount(e.target.value);
                            }}
                            className="w-full bg-[#0B0F14] border rounded-xl pl-8 pr-4 py-3 text-sm font-mono text-[#E6EDF3] focus:outline-none transition-colors"
                            style={{
                              borderColor: amountError
                                ? "rgba(239,68,68,0.6)"
                                : "rgba(255,140,0,0.3)",
                            }}
                          />
                        </div>
                        {amountError && (
                          <p
                            data-ocid="deposit.amount.error_state"
                            className="text-[#EF4444] text-[11px] mt-1.5 font-medium"
                          >
                            {amountError}
                          </p>
                        )}
                      </div>

                      {/* Confirm */}
                      <button
                        type="button"
                        data-ocid="deposit.confirm_button"
                        onClick={handleConfirm}
                        disabled={!amountValid || !canDeposit}
                        className="cyber-btn-primary w-full py-3.5 text-sm font-extrabold tracking-[0.2em] uppercase rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        CONFIRM DEPOSIT
                      </button>

                      <p className="text-[10px] text-[#6B7C8F] text-center">
                        {remainingSlots} deposit slot
                        {remainingSlots !== 1 ? "s" : ""} remaining this cycle
                      </p>
                    </div>
                  )}
                </>
              )}
            </section>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
