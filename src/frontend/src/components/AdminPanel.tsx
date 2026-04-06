import { Principal } from "@icp-sdk/core/principal";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  DepositOutput,
  Faq,
  FullNotification,
  SiteStats,
  backendInterface,
} from "../backend.d";
import { useStorageClient } from "../hooks/useStorageClient";

interface AdminPanelProps {
  actor: backendInterface;
}

type AdminTab =
  | "QUEUE"
  | "USERS"
  | "STATS"
  | "FAQ"
  | "CONTENT"
  | "NOTIFICATIONS";

const ADMIN_TABS: { id: AdminTab; label: string }[] = [
  { id: "QUEUE", label: "Transaction Queue" },
  { id: "USERS", label: "User Management" },
  { id: "STATS", label: "Site Stats" },
  { id: "FAQ", label: "FAQ Editor" },
  { id: "CONTENT", label: "Content Editor" },
  { id: "NOTIFICATIONS", label: "Notifications" },
];

const ASSET_COLORS: Record<string, string> = {
  ICP: "#A855F7",
  BTC: "#F59E0B",
  BCH: "#22C55E",
  BNB: "#EAB308",
  EGLD: "#60A5FA",
};

function DepositStatusBadge({ status }: { status: string }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-green-500/10 text-green-400 border border-green-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        VERIFIED
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-red-500/10 text-red-400 border border-red-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        REJECTED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      PENDING
    </span>
  );
}

/** Shortens a principal to first-6...last-4 for display */
function shortPrincipal(p: string): string {
  if (!p || p.length <= 12) return p;
  return `${p.slice(0, 8)}\u2026${p.slice(-6)}`;
}

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

function TransactionQueue({ actor }: { actor: backendInterface }) {
  const [deposits, setDeposits] = useState<DepositOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { getUrl } = useStorageClient();

  const fetchDeposits = useCallback(async () => {
    setLoading(true);
    try {
      const result = await actor.getAllDeposits();
      // Sort: pending first
      const sorted = [...result].sort((a, b) => {
        const aS = a.status as unknown as string;
        const bS = b.status as unknown as string;
        if (aS === "pending" && bS !== "pending") return -1;
        if (bS === "pending" && aS !== "pending") return 1;
        return Number(b.timestamp - a.timestamp);
      });
      setDeposits(sorted);
    } catch {
      toast.error("Failed to load deposits");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  async function handleApprove(id: bigint) {
    const key = `approve-${id}`;
    setActionLoading(key);
    try {
      await actor.approveDeposit(id);
      toast.success("Deposit approved");
      await fetchDeposits();
    } catch {
      toast.error("Failed to approve deposit");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: bigint) {
    const key = `reject-${id}`;
    setActionLoading(key);
    try {
      await actor.rejectDeposit(id);
      toast.success("Deposit rejected");
      await fetchDeposits();
    } catch {
      toast.error("Failed to reject deposit");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#FF8C00]/30 border-t-[#FF8C00] rounded-full animate-spin" />
      </div>
    );
  }

  if (deposits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-12 h-12 rounded-full border border-[#FF8C00]/30 flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF8C00"
            strokeWidth="1.5"
            strokeLinecap="round"
            role="img"
            aria-label="No deposits"
          >
            <rect x="1" y="6" width="22" height="15" rx="2" />
            <path d="M1 10h22" />
          </svg>
        </div>
        <p className="text-sm text-[#93A4B7]">No deposits submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#FF8C00]/10">
            {[
              "DATE",
              "USER",
              "ASSET",
              "AMOUNT",
              "TXID",
              "PROOF",
              "STATUS",
              "ACTIONS",
            ].map((col) => (
              <th
                key={col}
                className="text-left text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#6B7C8F] py-4 px-3 bg-[#0B0F14]/60 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {deposits.map((d) => {
            const statusStr = d.status as unknown as string;
            const isPending = statusStr === "pending";
            const ts = Number(d.timestamp) / 1_000_000;

            return (
              <tr
                key={d.id.toString()}
                className="border-b border-white/5 hover:bg-[#FF8C00]/3 transition-colors"
              >
                <td className="py-3 px-3">
                  <span className="text-[11px] text-[#E6EDF3] font-mono">
                    {new Date(ts).toLocaleDateString("en-GB")}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span
                    className="text-[11px] font-mono text-[#93A4B7]"
                    title={d.userPrincipal}
                  >
                    {shortPrincipal(d.userPrincipal)}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: ASSET_COLORS[d.asset] ?? "#93A4B7",
                      }}
                    />
                    <span className="text-xs font-extrabold text-[#E6EDF3]">
                      {d.asset}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="text-sm font-extrabold text-[#FF8C00]">
                    ${Number(d.amount).toLocaleString()}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[11px] font-mono text-[#93A4B7]">
                    {d.txid ? `${d.txid.slice(0, 12)}\u2026` : "\u2014"}
                  </span>
                </td>
                <td className="py-3 px-3">
                  {d.screenshotBlobId ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (d.screenshotBlobId) {
                          const url = getUrl(d.screenshotBlobId);
                          window.open(url, "_blank");
                        }
                      }}
                      className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-lg border border-[#FF8C00]/40 text-[#FF8C00] hover:bg-[#FF8C00]/10 transition-colors"
                    >
                      VIEW
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#6B7C8F]">None</span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <DepositStatusBadge status={statusStr} />
                </td>
                <td className="py-3 px-3">
                  {isPending ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleApprove(d.id)}
                        disabled={actionLoading !== null}
                        className="text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === `approve-${d.id}`
                          ? "\u2026"
                          : "APPROVE"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(d.id)}
                        disabled={actionLoading !== null}
                        className="text-[10px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === `reject-${d.id}`
                          ? "\u2026"
                          : "REJECT"}
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#6B7C8F] italic">
                      \u2014
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SiteStatsTab({ actor }: { actor: backendInterface }) {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    actor
      .getSiteStats()
      .then(setStats)
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, [actor]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#FF8C00]/30 border-t-[#FF8C00] rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: "TOTAL USERS", value: Number(stats.totalUsers), color: "#FF8C00" },
    {
      label: "TOTAL DEPOSITS",
      value: Number(stats.totalDeposits),
      color: "#60A5FA",
    },
    { label: "PENDING", value: Number(stats.pendingCount), color: "#F59E0B" },
    { label: "APPROVED", value: Number(stats.approvedCount), color: "#22C55E" },
    { label: "REJECTED", value: Number(stats.rejectedCount), color: "#EF4444" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="cyber-card !py-4 !px-5 flex flex-col gap-1"
        >
          <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#6B7C8F]">
            {c.label}
          </span>
          <span className="text-2xl font-extrabold" style={{ color: c.color }}>
            {c.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function UserManagementTab({ actor }: { actor: backendInterface }) {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    actor
      .getSiteStats()
      .then(setStats)
      .catch(() => toast.error("Failed to load user data"))
      .finally(() => setLoading(false));
  }, [actor]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#FF8C00]/30 border-t-[#FF8C00] rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="cyber-card !py-4 !px-5">
          <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#6B7C8F] block mb-1">
            REGISTERED USERS
          </span>
          <span className="text-3xl font-extrabold text-[#FF8C00]">
            {Number(stats.totalUsers)}
          </span>
        </div>
        <div className="cyber-card !py-4 !px-5">
          <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#6B7C8F] block mb-1">
            TOTAL DEPOSITS SUBMITTED
          </span>
          <span className="text-3xl font-extrabold text-[#60A5FA]">
            {Number(stats.totalDeposits)}
          </span>
        </div>
      </div>
      <div className="cyber-card">
        <p className="text-xs text-[#93A4B7] leading-relaxed">
          User management currently shows aggregate statistics. Individual user
          profiles are tied to their ICP Internet Identity principal. The first
          user to authenticate became the admin automatically.
        </p>
      </div>
    </div>
  );
}

function FAQEditor({ actor }: { actor: backendInterface }) {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    actor
      .getFAQs()
      .then(setFaqs)
      .catch(() => toast.error("Failed to load FAQs"))
      .finally(() => setLoading(false));
  }, [actor]);

  function addFaq() {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  }

  function updateFaq(idx: number, field: "question" | "answer", value: string) {
    setFaqs((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [field]: value } : f)),
    );
  }

  function removeFaq(idx: number) {
    setFaqs((prev) => prev.filter((_, i) => i !== idx));
  }

  async function saveFaqs() {
    setSaving(true);
    try {
      await actor.setFAQs(faqs);
      toast.success("FAQs saved successfully");
    } catch {
      toast.error("Failed to save FAQs");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#FF8C00]/30 border-t-[#FF8C00] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {faqs.map((faq, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: FAQs are reordered by user, index is appropriate
        <div key={idx} className="cyber-card flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#FF8C00]">
              FAQ #{idx + 1}
            </span>
            <button
              type="button"
              onClick={() => removeFaq(idx)}
              className="text-[10px] font-bold tracking-widest uppercase text-red-400 hover:text-red-300 transition-colors"
            >
              DELETE
            </button>
          </div>
          <div>
            <label
              htmlFor={`faq-q-${idx}`}
              className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#93A4B7] block mb-1.5"
            >
              QUESTION
            </label>
            <input
              id={`faq-q-${idx}`}
              type="text"
              value={faq.question}
              onChange={(e) => updateFaq(idx, "question", e.target.value)}
              placeholder="Enter FAQ question..."
              className="w-full bg-[#0B0F14] border border-[#FF8C00]/30 rounded-xl px-4 py-2.5 text-sm text-[#E6EDF3] focus:outline-none focus:border-[#FF8C00]/70 placeholder:text-[#6B7C8F]/60"
            />
          </div>
          <div>
            <label
              htmlFor={`faq-a-${idx}`}
              className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#93A4B7] block mb-1.5"
            >
              ANSWER
            </label>
            <textarea
              id={`faq-a-${idx}`}
              value={faq.answer}
              onChange={(e) => updateFaq(idx, "answer", e.target.value)}
              placeholder="Enter FAQ answer..."
              rows={3}
              className="w-full bg-[#0B0F14] border border-[#FF8C00]/30 rounded-xl px-4 py-2.5 text-sm text-[#E6EDF3] focus:outline-none focus:border-[#FF8C00]/70 placeholder:text-[#6B7C8F]/60 resize-none"
            />
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={addFaq}
          className="flex-1 py-3 text-xs font-bold tracking-widest uppercase rounded-xl border border-[#FF8C00]/40 text-[#FF8C00] hover:bg-[#FF8C00]/10 transition-colors"
        >
          + ADD FAQ
        </button>
        <button
          type="button"
          onClick={saveFaqs}
          disabled={saving}
          className="flex-1 cyber-btn-primary py-3 text-xs font-extrabold tracking-widest uppercase rounded-xl disabled:opacity-60"
        >
          {saving ? "SAVING\u2026" : "SAVE FAQS"}
        </button>
      </div>
    </div>
  );
}

function ContentEditor({ actor }: { actor: backendInterface }) {
  const [terms, setTerms] = useState("");
  const [policy, setPolicy] = useState("");
  const [loadingTerms, setLoadingTerms] = useState(true);
  const [loadingPolicy, setLoadingPolicy] = useState(true);
  const [savingTerms, setSavingTerms] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);

  useEffect(() => {
    actor
      .getTerms()
      .then(setTerms)
      .catch(() => toast.error("Failed to load Terms"))
      .finally(() => setLoadingTerms(false));
    actor
      .getPolicy()
      .then(setPolicy)
      .catch(() => toast.error("Failed to load Policy"))
      .finally(() => setLoadingPolicy(false));
  }, [actor]);

  async function saveTerms() {
    setSavingTerms(true);
    try {
      await actor.setTerms(terms);
      toast.success("Terms & Conditions saved");
    } catch {
      toast.error("Failed to save Terms");
    } finally {
      setSavingTerms(false);
    }
  }

  async function savePolicy() {
    setSavingPolicy(true);
    try {
      await actor.setPolicy(policy);
      toast.success("User Policy saved");
    } catch {
      toast.error("Failed to save Policy");
    } finally {
      setSavingPolicy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Terms & Conditions */}
      <div className="cyber-card flex flex-col gap-4">
        <h3 className="card-heading text-[#FF8C00]">TERMS & CONDITIONS</h3>
        {loadingTerms ? (
          <div className="h-48 bg-[#0B0F14] rounded-xl animate-pulse" />
        ) : (
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Enter Terms & Conditions content here..."
            rows={12}
            className="w-full bg-[#0B0F14] border border-[#FF8C00]/30 rounded-xl px-4 py-3 text-sm text-[#E6EDF3] focus:outline-none focus:border-[#FF8C00]/70 placeholder:text-[#6B7C8F]/60 resize-y"
          />
        )}
        <button
          type="button"
          onClick={saveTerms}
          disabled={savingTerms || loadingTerms}
          className="self-end cyber-btn-primary px-8 py-2.5 text-xs font-extrabold tracking-widest uppercase rounded-xl disabled:opacity-60"
        >
          {savingTerms ? "SAVING\u2026" : "SAVE TERMS"}
        </button>
      </div>

      {/* User Policy */}
      <div className="cyber-card flex flex-col gap-4">
        <h3 className="card-heading text-[#FF8C00]">USER POLICY</h3>
        {loadingPolicy ? (
          <div className="h-48 bg-[#0B0F14] rounded-xl animate-pulse" />
        ) : (
          <textarea
            value={policy}
            onChange={(e) => setPolicy(e.target.value)}
            placeholder="Enter User Policy content here..."
            rows={12}
            className="w-full bg-[#0B0F14] border border-[#FF8C00]/30 rounded-xl px-4 py-3 text-sm text-[#E6EDF3] focus:outline-none focus:border-[#FF8C00]/70 placeholder:text-[#6B7C8F]/60 resize-y"
          />
        )}
        <button
          type="button"
          onClick={savePolicy}
          disabled={savingPolicy || loadingPolicy}
          className="self-end cyber-btn-primary px-8 py-2.5 text-xs font-extrabold tracking-widest uppercase rounded-xl disabled:opacity-60"
        >
          {savingPolicy ? "SAVING\u2026" : "SAVE POLICY"}
        </button>
      </div>
    </div>
  );
}

function NotificationsTab({ actor }: { actor: backendInterface }) {
  const [message, setMessage] = useState("");
  const [targetMode, setTargetMode] = useState<"all" | "specific">("all");
  const [targetPrincipal, setTargetPrincipal] = useState("");
  const [sending, setSending] = useState(false);
  const [sentHistory, setSentHistory] = useState<FullNotification[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const list = await actor.getMyNotifications();
      const sorted = [...list].sort((a, b) =>
        Number(b.timestamp - a.timestamp),
      );
      setSentHistory(sorted);
    } catch {
      // silently ignore
    } finally {
      setHistoryLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function handleSend() {
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    let targetPrincipalObj: Principal | null = null;
    if (targetMode === "specific") {
      if (!targetPrincipal.trim()) {
        toast.error("Please enter a target principal ID.");
        return;
      }
      try {
        targetPrincipalObj = Principal.fromText(targetPrincipal.trim());
      } catch {
        toast.error("Invalid principal ID format.");
        return;
      }
    }

    setSending(true);
    try {
      await actor.sendNotification(message.trim(), targetPrincipalObj);
      toast.success(
        targetMode === "all"
          ? "Broadcast sent to all users!"
          : "Notification sent to user!",
      );
      setMessage("");
      setTargetPrincipal("");
      await fetchHistory();
    } catch {
      toast.error("Failed to send notification.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Compose Form */}
      <div
        className="cyber-card flex flex-col gap-5"
        data-ocid="admin.notifications.card"
      >
        <div>
          <h3 className="card-heading text-[#FF8C00] mb-1">
            BROADCAST NOTIFICATIONS
          </h3>
          <p className="text-[11px] text-[#6B7C8F]">
            Send a message to all users or a specific user by their ICP
            principal ID.
          </p>
        </div>

        {/* Message textarea */}
        <div>
          <label
            htmlFor="notification-message"
            className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#93A4B7] block mb-1.5"
          >
            MESSAGE
          </label>
          <textarea
            id="notification-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your notification message..."
            rows={4}
            data-ocid="admin.notifications.textarea"
            className="w-full bg-[#0B0F14] border border-[#FF8C00]/30 rounded-xl px-4 py-3 text-sm text-[#E6EDF3] focus:outline-none focus:border-[#FF8C00]/70 placeholder:text-[#6B7C8F]/60 resize-none"
          />
        </div>

        {/* Target mode radio */}
        <div>
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#93A4B7] block mb-3">
            SEND TO
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              data-ocid="admin.notifications.all.toggle"
              onClick={() => setTargetMode("all")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-200 border ${
                targetMode === "all"
                  ? "bg-[#FF8C00]/20 text-[#FF8C00] border-[#FF8C00]/50"
                  : "bg-[#0B0F14] text-[#93A4B7] border-white/10 hover:text-[#E6EDF3] hover:border-[#FF8C00]/20"
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  targetMode === "all" ? "border-[#FF8C00]" : "border-[#6B7C8F]"
                }`}
              >
                {targetMode === "all" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00]" />
                )}
              </span>
              ALL USERS
            </button>
            <button
              type="button"
              data-ocid="admin.notifications.specific.toggle"
              onClick={() => setTargetMode("specific")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-200 border ${
                targetMode === "specific"
                  ? "bg-[#FF8C00]/20 text-[#FF8C00] border-[#FF8C00]/50"
                  : "bg-[#0B0F14] text-[#93A4B7] border-white/10 hover:text-[#E6EDF3] hover:border-[#FF8C00]/20"
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  targetMode === "specific"
                    ? "border-[#FF8C00]"
                    : "border-[#6B7C8F]"
                }`}
              >
                {targetMode === "specific" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00]" />
                )}
              </span>
              SPECIFIC USER
            </button>
          </div>
        </div>

        {/* Target principal input */}
        {targetMode === "specific" && (
          <div>
            <label
              htmlFor="target-principal"
              className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#93A4B7] block mb-1.5"
            >
              TARGET PRINCIPAL ID
            </label>
            <input
              id="target-principal"
              type="text"
              value={targetPrincipal}
              onChange={(e) => setTargetPrincipal(e.target.value)}
              placeholder="e.g. xxxxx-xxxxx-xxxxx-xxxxx-xxx"
              data-ocid="admin.notifications.input"
              className="w-full bg-[#0B0F14] border border-[#FF8C00]/30 rounded-xl px-4 py-2.5 text-sm text-[#E6EDF3] font-mono focus:outline-none focus:border-[#FF8C00]/70 placeholder:text-[#6B7C8F]/60"
            />
          </div>
        )}

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !message.trim()}
          data-ocid="admin.notifications.submit_button"
          className="self-start cyber-btn-primary px-8 py-3 text-xs font-extrabold tracking-widest uppercase rounded-xl disabled:opacity-60"
        >
          {sending
            ? "SENDING\u2026"
            : targetMode === "all"
              ? "\u{1F4E2} BROADCAST TO ALL"
              : "\u{1F514} SEND TO USER"}
        </button>
      </div>

      {/* Sent History */}
      <div className="cyber-card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="card-heading text-[#FF8C00]">NOTIFICATION HISTORY</h3>
          <button
            type="button"
            onClick={fetchHistory}
            className="text-[9px] font-bold tracking-widest uppercase text-[#6B7C8F] hover:text-[#FF8C00] transition-colors"
          >
            REFRESH
          </button>
        </div>

        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#FF8C00]/30 border-t-[#FF8C00] rounded-full animate-spin" />
          </div>
        ) : sentHistory.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-8 gap-2"
            data-ocid="admin.notifications.empty_state"
          >
            <p className="text-xs text-[#6B7C8F]">No notifications sent yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {sentHistory.map((n, idx) => (
              <li
                key={n.id.toString()}
                data-ocid={`admin.notifications.item.${idx + 1}`}
                className="py-3 flex flex-col gap-1"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-[#E6EDF3] leading-relaxed flex-1">
                    {n.message}
                  </p>
                  <span
                    className={`flex-shrink-0 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${
                      n.targetAll
                        ? "text-[#FF8C00] border-[#FF8C00]/30 bg-[#FF8C00]/8"
                        : "text-[#60A5FA] border-[#60A5FA]/30 bg-[#60A5FA]/8"
                    }`}
                  >
                    {n.targetAll ? "ALL" : "SPECIFIC"}
                  </span>
                </div>
                <p className="text-[10px] text-[#6B7C8F]">
                  {formatRelativeTime(n.timestamp)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AdminPanel({ actor }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("QUEUE");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="card-heading text-red-400 text-xl">
            \u2699 ADMIN COMMAND CENTER
          </h1>
          <p className="text-[11px] text-[#6B7C8F] mt-1 tracking-wide">
            Full system control \u2014 restricted to authenticated
            administrators
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-400/30 bg-red-400/5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase">
            ADMIN MODE
          </span>
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-[0.14em] uppercase transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/50"
                : "bg-[#0F1720] text-[#93A4B7] border border-white/5 hover:text-[#E6EDF3] hover:border-[#FF8C00]/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "QUEUE" && (
          <div className="cyber-card !p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#FF8C00]/10">
              <h2 className="card-heading text-[#FF8C00]">TRANSACTION QUEUE</h2>
              <p className="text-[11px] text-[#6B7C8F] mt-0.5">
                Review and verify submitted deposits
              </p>
            </div>
            <TransactionQueue actor={actor} />
          </div>
        )}

        {activeTab === "USERS" && <UserManagementTab actor={actor} />}

        {activeTab === "STATS" && <SiteStatsTab actor={actor} />}

        {activeTab === "FAQ" && <FAQEditor actor={actor} />}

        {activeTab === "CONTENT" && <ContentEditor actor={actor} />}

        {activeTab === "NOTIFICATIONS" && <NotificationsTab actor={actor} />}
      </div>
    </div>
  );
}
