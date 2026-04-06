import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Faq, backendInterface } from "../backend.d";

interface InfoModalProps {
  page: "about" | "terms" | "support" | "faq" | null;
  onClose: () => void;
  actor?: backendInterface;
}

const PAGE_TITLES: Record<string, string> = {
  about: "ABOUT ADIFUNDBROKER",
  terms: "TERMS & CONDITIONS",
  support: "SUPPORT",
  faq: "FREQUENTLY ASKED QUESTIONS",
};

function Spinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-8 h-8 border-2 border-[#FF8C00]/30 border-t-[#FF8C00] rounded-full animate-spin" />
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-extrabold tracking-widest uppercase text-[#FF8C00] mb-2 mt-6 first:mt-0">
      {children}
    </h3>
  );
}

function BodyText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#93A4B7] leading-relaxed">{children}</p>;
}

// ─── About ──────────────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <div>
      <SectionHeading>PREMIER WEB3 STRATEGY &amp; RWA ROADMAP</SectionHeading>
      <BodyText>
        Adifundbroker is an advanced Web3 environment engineered for the next
        generation of digital asset management. Our protocol leverages
        high-frequency market analysis and Real World Asset (RWA)
        diversification models to deliver a sophisticated "Proof-of-Strategy"
        ecosystem. By participating in our multi-sector roadmap — spanning
        decentralised liquidity, specialised market simulations, and
        confidential RWA developments — users engage with institutional-grade
        strategy mechanics in a competitive GameFi setting.
      </BodyText>

      <SectionHeading>MULTI-SECTOR STRATEGY</SectionHeading>
      <BodyText>
        Our protocol is built around a diversified strategic framework. Each
        participation tier unlocks a higher Strategy Power Level (SPL),
        reflecting the compounding advantage of multi-sector engagement. From
        base-layer market strategies to advanced RWA allocation models, the
        platform is designed to reward depth of participation.
      </BodyText>

      <SectionHeading>RWA ROADMAP</SectionHeading>
      <BodyText>
        Adifundbroker&apos;s RWA Roadmap charts the integration of Real World
        Asset mechanics into the Web3 strategy layer. While specific RWA
        allocations remain proprietary to preserve strategic edge, our roadmap
        operates with full transparency in reward distribution and participant
        fund security within the simulation environment.
      </BodyText>

      <SectionHeading>PLATFORM INFRASTRUCTURE</SectionHeading>
      <BodyText>
        Built on the Internet Computer Protocol (ICP). Authentication is handled
        via Decentralised Sovereign Identity — powered by ICP Internet Identity.
        No passwords, no custodial accounts. All strategy entries and
        verifications are processed on-chain by our Strategy Managers via the
        Admin Command Center.
      </BodyText>

      <SectionHeading>SIMULATION NOTICE</SectionHeading>
      <BodyText>
        Adifundbroker is a Web3 strategy simulation platform. All strategy
        outputs, multipliers, and projected figures displayed are simulated
        within the platform environment for demonstration and research purposes.
        No real financial transactions or guaranteed returns are implied.
      </BodyText>
    </div>
  );
}

// ─── Terms ──────────────────────────────────────────────────────────────────
function TermsPage({ actor }: { actor?: backendInterface }) {
  const [termsText, setTermsText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) {
      setLoading(false);
      return;
    }
    actor
      .getTerms()
      .then((text) => setTermsText(text))
      .catch(() => setTermsText(null))
      .finally(() => setLoading(false));
  }, [actor]);

  if (loading) return <Spinner />;

  if (!termsText || termsText.trim() === "") {
    return (
      <BodyText>
        Terms &amp; Conditions are being updated. Please check back soon.
      </BodyText>
    );
  }

  return (
    <pre className="text-sm text-[#93A4B7] leading-relaxed whitespace-pre-wrap font-sans">
      {termsText}
    </pre>
  );
}

// ─── Support ─────────────────────────────────────────────────────────────────
const SUPPORT_TOPICS = [
  {
    title: "Deposit Verification Delays",
    body: "Strategy entries are manually reviewed by the Strategy Manager team. Verification typically takes 24–72 hours after submission.",
  },
  {
    title: "Login Issues",
    body: "Ensure you are using the correct ICP Internet Identity. Clear your browser cache if you experience login loops.",
  },
  {
    title: "Rejected Transactions",
    body: "If your entry was rejected, check that the TXID and screenshot match the correct wallet address for the selected asset.",
  },
  {
    title: "Deposit Limits",
    body: "Users are limited to 3 strategy entries per 30-day cycle. The reset timer is visible in the Wallet tab.",
  },
];

function SupportPage() {
  return (
    <div>
      <SectionHeading>GETTING HELP</SectionHeading>
      <BodyText>
        For assistance with your account, strategy entries, or platform
        features, contact the Adifundbroker support team. Response times are
        typically within 24–48 hours.
      </BodyText>

      <SectionHeading>COMMON TOPICS</SectionHeading>
      <div className="flex flex-col gap-2 mt-1">
        {SUPPORT_TOPICS.map((topic) => (
          <div
            key={topic.title}
            className="rounded-lg border border-[#FF8C00]/15 bg-[#0F1720] px-4 py-3"
          >
            <p className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wide mb-1">
              {topic.title}
            </p>
            <p className="text-sm text-[#93A4B7] leading-relaxed">
              {topic.body}
            </p>
          </div>
        ))}
      </div>

      <SectionHeading>CONTACT</SectionHeading>
      <BodyText>
        Reach us via the official Adifundbroker support channel. Include your
        user principal ID and a description of your issue for faster resolution.
      </BodyText>
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
function FaqItem({ faq }: { faq: Faq }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-[#FF8C00]/15 rounded-lg bg-[#0F1720] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left gap-3 hover:bg-[#FF8C00]/5 transition-colors"
        data-ocid="faq.item.toggle"
      >
        <span className="text-sm font-bold text-[#E6EDF3]">{faq.question}</span>
        <span className="flex-shrink-0 text-[#FF8C00]">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-[#FF8C00]/10">
          <p className="text-sm text-[#93A4B7] leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

function FaqPage({ actor }: { actor?: backendInterface }) {
  const [faqs, setFaqs] = useState<Faq[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) {
      setLoading(false);
      return;
    }
    actor
      .getFAQs()
      .then((data) => setFaqs(data))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, [actor]);

  if (loading) return <Spinner />;

  if (!faqs || faqs.length === 0) {
    return <BodyText>No FAQs available yet.</BodyText>;
  }

  return (
    <div className="flex flex-col gap-2">
      {faqs.map((faq, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: stable FAQ order
        <FaqItem key={i} faq={faq} />
      ))}
    </div>
  );
}

// ─── Modal Shell ─────────────────────────────────────────────────────────────
export default function InfoModal({ page, onClose, actor }: InfoModalProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (page) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [page]);

  if (!page) return null;

  function handleBackdropKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      onClose();
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleBackdropKey}
      role="presentation"
      data-ocid="info.modal"
    >
      {/* Panel */}
      <dialog
        open
        aria-modal="true"
        aria-label={PAGE_TITLES[page]}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0B0F14] border border-[#FF8C00]/20 rounded-2xl shadow-2xl overflow-hidden p-0 m-0"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#FF8C00]/15 flex-shrink-0">
          <h2 className="text-sm font-extrabold tracking-widest uppercase text-[#FF8C00]">
            {PAGE_TITLES[page]}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-ocid="info.modal.close_button"
            className="text-[#93A4B7] hover:text-[#E6EDF3] transition-colors rounded-lg p-1 hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {page === "about" && <AboutPage />}
          {page === "terms" && <TermsPage actor={actor} />}
          {page === "support" && <SupportPage />}
          {page === "faq" && <FaqPage actor={actor} />}
        </div>
      </dialog>
    </div>
  );
}
