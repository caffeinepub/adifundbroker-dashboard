import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useStorageClient } from "../hooks/useStorageClient";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (
    asset: string,
    amount: number,
    txid?: string,
    screenshotBlobId?: string,
  ) => Promise<void>;
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

const STEP_LABELS = ["SELECT", "ADDRESS", "PROOF", "CONFIRM"];

export default function DepositModal({
  isOpen,
  onClose,
  onDeposit,
  depositsUsed,
  canDeposit,
  remainingSlots,
  daysUntilReset,
}: DepositModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0].symbol);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [copied, setCopied] = useState(false);
  const [txid, setTxid] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useStorageClient();

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

  async function handleConfirmPayment() {
    if (!txid.trim()) return;
    setSubmitting(true);
    try {
      let screenshotBlobId: string | undefined;

      // Upload screenshot if provided
      if (screenshotFile) {
        setUploading(true);
        setUploadProgress(0);
        const hash = await uploadFile(screenshotFile, (pct) => {
          setUploadProgress(pct);
        });
        setUploading(false);
        if (hash) {
          screenshotBlobId = hash;
        }
      }

      await onDeposit(selectedAsset, numAmount, txid.trim(), screenshotBlobId);
      setStep(4);
    } catch (err) {
      console.error("Deposit submission failed:", err);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }

  function handleClose() {
    setStep(1);
    setSelectedAsset(ASSETS[0].symbol);
    setAmount("");
    setAmountError("");
    setCopied(false);
    setTxid("");
    setScreenshotFile(null);
    setUploading(false);
    setUploadProgress(0);
    setSubmitting(false);
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
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
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

              {/* Step indicators */}
              {step !== 4 && (
                <div className="flex items-center justify-center gap-0 mb-6">
                  {STEP_LABELS.map((label, i) => {
                    const stepNum = (i + 1) as 1 | 2 | 3 | 4;
                    const isActive = step === stepNum;
                    const isDone = step > stepNum;
                    return (
                      <div key={label} className="flex items-center">
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all duration-300"
                            style={{
                              background: isActive
                                ? "rgba(255,140,0,0.2)"
                                : isDone
                                  ? "rgba(34,197,94,0.15)"
                                  : "rgba(11,15,20,0.8)",
                              border: isActive
                                ? "2px solid #FF8C00"
                                : isDone
                                  ? "2px solid #22C55E"
                                  : "2px solid rgba(107,124,143,0.3)",
                              boxShadow: isActive
                                ? "0 0 12px rgba(255,140,0,0.5)"
                                : isDone
                                  ? "0 0 8px rgba(34,197,94,0.3)"
                                  : "none",
                              color: isActive
                                ? "#FF8C00"
                                : isDone
                                  ? "#22C55E"
                                  : "#6B7C8F",
                            }}
                          >
                            {isDone ? (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                role="img"
                                aria-label="Step complete"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              stepNum
                            )}
                          </div>
                          <span
                            className="text-[8px] font-bold tracking-widest uppercase"
                            style={{
                              color: isActive
                                ? "#FF8C00"
                                : isDone
                                  ? "#22C55E"
                                  : "#6B7C8F",
                            }}
                          >
                            {label}
                          </span>
                        </div>
                        {i < STEP_LABELS.length - 1 && (
                          <div
                            className="w-8 h-px mx-1 mb-4 transition-all duration-300"
                            style={{
                              background: isDone
                                ? "#22C55E"
                                : "rgba(107,124,143,0.2)",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  <div>
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
                      className="bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl p-4 text-center"
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
                    <>
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
                      <button
                        type="button"
                        data-ocid="deposit.step1.primary_button"
                        onClick={() => setStep(2)}
                        disabled={!amountValid}
                        className="cyber-btn-primary w-full py-3.5 text-sm font-extrabold tracking-[0.2em] uppercase rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        NEXT →
                      </button>
                      <p className="text-[10px] text-[#6B7C8F] text-center">
                        {remainingSlots} deposit slot
                        {remainingSlots !== 1 ? "s" : ""} remaining this cycle
                      </p>
                    </>
                  )}
                </motion.div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-5"
                >
                  <div className="text-center">
                    <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#93A4B7] mb-1">
                      SEND PAYMENT TO
                    </p>
                    <p className="text-xl font-extrabold tracking-widest text-[#FF8C00]">
                      {asset.symbol}
                    </p>
                    <p className="text-xs text-[#6B7C8F]">{asset.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#93A4B7] block mb-2">
                      DEPOSIT ADDRESS
                    </p>
                    <div className="bg-[#0B0F14] border border-white/10 rounded-xl px-3 py-3 mb-2">
                      <code className="block text-[11px] font-mono text-[#93A4B7] break-all leading-relaxed">
                        {asset.address}
                      </code>
                    </div>
                    <button
                      type="button"
                      data-ocid="deposit.copy.button"
                      onClick={handleCopy}
                      className="w-full flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest uppercase px-3 py-2.5 rounded-xl transition-all duration-200 border"
                      style={{
                        color: copied ? "#22C55E" : "#FF8C00",
                        borderColor: copied ? "#22C55E" : "#FF8C00",
                        background: copied
                          ? "rgba(34,197,94,0.08)"
                          : "rgba(255,140,0,0.08)",
                      }}
                    >
                      {copied ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          role="img"
                          aria-label="Copied"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          role="img"
                          aria-label="Copy"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                      {copied ? "ADDRESS COPIED!" : "COPY ADDRESS"}
                    </button>
                  </div>
                  <div className="bg-[#FF8C00]/5 border border-[#FF8C00]/20 rounded-xl px-4 py-3">
                    <p className="text-[10px] text-[#93A4B7] leading-relaxed">
                      <span className="text-[#FF8C00] font-bold">
                        ⚠ IMPORTANT:
                      </span>{" "}
                      Send exactly{" "}
                      <span className="text-[#E6EDF3] font-bold">
                        £{Number(amount).toLocaleString()}
                      </span>{" "}
                      worth of{" "}
                      <span className="text-[#FF8C00] font-bold">
                        {asset.symbol}
                      </span>{" "}
                      to the address above. Keep your transaction hash — you'll
                      need it in the next step.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      data-ocid="deposit.step2.cancel_button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded-xl border border-[#93A4B7]/30 text-[#93A4B7] hover:text-[#E6EDF3] hover:border-[#93A4B7]/60 transition-all"
                    >
                      ← BACK
                    </button>
                    <button
                      type="button"
                      data-ocid="deposit.step2.primary_button"
                      onClick={() => setStep(3)}
                      className="flex-1 cyber-btn-primary py-3 text-xs font-extrabold tracking-widest uppercase rounded-xl"
                    >
                      NEXT →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <label
                      htmlFor="txid-input"
                      className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#93A4B7] block mb-2"
                    >
                      TRANSACTION HASH (TXID)
                    </label>
                    <input
                      id="txid-input"
                      data-ocid="deposit.txid.input"
                      type="text"
                      placeholder="0x1a2b3c4d... or transaction ID"
                      value={txid}
                      onChange={(e) => setTxid(e.target.value)}
                      className="w-full bg-[#0B0F14] border border-[#FF8C00]/30 rounded-xl px-4 py-3 text-sm font-mono text-[#E6EDF3] focus:outline-none focus:border-[#FF8C00]/70 transition-colors placeholder:text-[#6B7C8F]/60"
                    />
                    {txid.trim() === "" && (
                      <p className="text-[10px] text-[#6B7C8F] mt-1.5">
                        Required to verify your payment on-chain.
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#93A4B7] block mb-2">
                      PAYMENT SCREENSHOT
                    </p>
                    <button
                      type="button"
                      data-ocid="deposit.upload_button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-xl transition-all duration-200 cursor-pointer disabled:cursor-wait"
                      style={{
                        border: screenshotFile
                          ? "2px dashed rgba(34,197,94,0.5)"
                          : "2px dashed rgba(255,140,0,0.4)",
                        background: screenshotFile
                          ? "rgba(34,197,94,0.05)"
                          : "rgba(255,140,0,0.03)",
                      }}
                    >
                      {uploading ? (
                        <>
                          <div className="w-7 h-7 border-2 border-[#FF8C00]/30 border-t-[#FF8C00] rounded-full animate-spin" />
                          <span className="text-xs font-bold text-[#FF8C00] tracking-widest uppercase">
                            UPLOADING… {uploadProgress}%
                          </span>
                        </>
                      ) : screenshotFile ? (
                        <>
                          <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#22C55E"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            role="img"
                            aria-label="File selected"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <polyline points="9 15 11 17 15 13" />
                          </svg>
                          <span className="text-xs font-bold text-[#22C55E] tracking-wide">
                            {screenshotFile.name}
                          </span>
                          <span className="text-[10px] text-[#6B7C8F]">
                            Click to change
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#FF8C00"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            role="img"
                            aria-label="Upload icon"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span className="text-xs font-bold text-[#FF8C00] tracking-widest uppercase">
                            UPLOAD SCREENSHOT
                          </span>
                          <span className="text-[10px] text-[#6B7C8F]">
                            Click to select image file
                          </span>
                        </>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setScreenshotFile(e.target.files?.[0] ?? null)
                      }
                      data-ocid="deposit.dropzone"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      data-ocid="deposit.step3.cancel_button"
                      onClick={() => setStep(2)}
                      disabled={submitting}
                      className="flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded-xl border border-[#93A4B7]/30 text-[#93A4B7] hover:text-[#E6EDF3] hover:border-[#93A4B7]/60 transition-all disabled:opacity-50"
                    >
                      ← BACK
                    </button>
                    <button
                      type="button"
                      data-ocid="deposit.confirm_button"
                      onClick={handleConfirmPayment}
                      disabled={!txid.trim() || submitting}
                      className="flex-1 cyber-btn-primary py-3 text-xs font-extrabold tracking-widest uppercase rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          SUBMITTING…
                        </span>
                      ) : (
                        "CONFIRM PAYMENT"
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  data-ocid="deposit.success_state"
                  className="flex flex-col items-center justify-center py-10 gap-5"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full border-2 border-[#22C55E] flex items-center justify-center"
                    style={{
                      boxShadow:
                        "0 0 32px rgba(34,197,94,0.4), 0 0 64px rgba(34,197,94,0.15)",
                    }}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      role="img"
                      aria-label="Payment submitted checkmark"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </motion.div>

                  <div className="text-center">
                    <p className="text-xl font-extrabold tracking-widest text-[#22C55E] uppercase mb-2">
                      PAYMENT SUBMITTED
                    </p>
                    <p className="text-sm text-[#E6EDF3] font-medium mb-1">
                      Awaiting Manager Verification.
                    </p>
                    <p className="text-[11px] text-[#6B7C8F] max-w-xs">
                      Your transaction is in the queue. Check your Wallet tab to
                      track verification status.
                    </p>
                  </div>

                  <div className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                      <span className="text-[#6B7C8F]">ASSET</span>
                      <span className="text-[#FF8C00] font-bold">
                        {selectedAsset}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest mt-2">
                      <span className="text-[#6B7C8F]">AMOUNT</span>
                      <span className="text-[#E6EDF3] font-bold">
                        £{Number(amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest mt-2">
                      <span className="text-[#6B7C8F]">STATUS</span>
                      <span className="text-amber-400 font-bold">
                        PENDING VERIFICATION
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    data-ocid="deposit.step4.close_button"
                    onClick={handleClose}
                    className="cyber-btn-primary w-full py-3.5 text-sm font-extrabold tracking-[0.2em] uppercase rounded-xl"
                  >
                    VIEW WALLET
                  </button>
                </motion.div>
              )}
            </section>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
