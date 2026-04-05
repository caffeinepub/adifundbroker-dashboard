import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Deposit } from "../types";

interface WalletTabProps {
  deposits: Deposit[];
}

const ASSET_COLORS: Record<string, string> = {
  ICP: "#A855F7",
  BTC: "#F59E0B",
  BCH: "#22C55E",
  BNB: "#EAB308",
  EGLD: "#60A5FA",
};

function StatusBadge({ status }: { status: Deposit["status"] }) {
  if (status === "Verified") {
    return (
      <div>
        <span
          data-ocid="wallet.status.success_state"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-green-500/10 text-green-400 border border-green-500/30"
          style={{ boxShadow: "0 0 8px rgba(34,197,94,0.15)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          VERIFIED & ACTIVE
        </span>
      </div>
    );
  }
  if (status === "Rejected") {
    return (
      <div className="flex flex-col gap-1">
        <span
          data-ocid="wallet.status.error_state"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-red-500/10 text-red-400 border border-red-500/30"
          style={{ boxShadow: "0 0 8px rgba(239,68,68,0.15)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          REJECTED
        </span>
        <span className="text-[10px] text-red-400/80 font-medium">
          Proof Invalid
        </span>
      </div>
    );
  }
  return (
    <span
      data-ocid="wallet.status.loading_state"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30"
      style={{ boxShadow: "0 0 8px rgba(245,158,11,0.15)" }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      PENDING
    </span>
  );
}

export default function WalletTab({ deposits }: WalletTabProps) {
  const sorted = [...deposits].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="card-heading text-[#FF8C00] text-lg sm:text-xl">
            TRANSACTION HISTORY
          </h1>
          <p className="text-[11px] text-[#6B7C8F] mt-1 tracking-wide">
            Track your deposit lifecycle and verification status
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#FF8C00]/20 bg-[#FF8C00]/5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00] animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-[#FF8C00] uppercase">
            {deposits.length} {deposits.length === 1 ? "DEPOSIT" : "DEPOSITS"}
          </span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "TOTAL DEPOSITED",
            value: `£${deposits.reduce((s, d) => s + d.amount, 0).toLocaleString()}`,
            color: "#FF8C00",
          },
          {
            label: "VERIFIED",
            value: deposits.filter((d) => d.status === "Verified").length,
            color: "#22C55E",
          },
          {
            label: "PENDING",
            value: deposits.filter((d) => d.status === "Pending").length,
            color: "#F59E0B",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="cyber-card !py-3 !px-4 flex flex-col gap-1"
          >
            <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#6B7C8F]">
              {stat.label}
            </span>
            <span
              className="text-lg font-extrabold tracking-wide"
              style={{ color: stat.color }}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="cyber-card !p-0 overflow-hidden">
        {sorted.length === 0 ? (
          <div
            data-ocid="wallet.empty_state"
            className="flex flex-col items-center justify-center py-16 gap-4"
          >
            <div
              className="w-14 h-14 rounded-full border border-[#FF8C00]/30 flex items-center justify-center"
              style={{ background: "rgba(255,140,0,0.05)" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FF8C00"
                strokeWidth="1.5"
                strokeLinecap="round"
                role="img"
                aria-label="No transactions"
              >
                <rect x="1" y="6" width="22" height="15" rx="2" />
                <path d="M1 10h22" />
                <circle cx="17" cy="15" r="1.5" fill="#FF8C00" stroke="none" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-[#93A4B7] tracking-wide">
                No transactions yet.
              </p>
              <p className="text-xs text-[#6B7C8F] mt-1">
                Make your first deposit to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-ocid="wallet.table">
              <TableHeader>
                <TableRow className="border-b border-[#FF8C00]/10 hover:bg-transparent">
                  {["DATE", "ASSET", "AMOUNT", "STATUS"].map((col) => (
                    <TableHead
                      key={col}
                      className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#6B7C8F] py-4 px-5 bg-[#0B0F14]/60"
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((deposit, idx) => (
                  <TableRow
                    key={deposit.id}
                    data-ocid={`wallet.item.${idx + 1}`}
                    className="border-b border-white/5 hover:bg-[#FF8C00]/3 transition-colors"
                  >
                    {/* Date */}
                    <TableCell className="py-4 px-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-[#E6EDF3]">
                          {new Date(deposit.timestamp).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                        <span className="text-[10px] text-[#6B7C8F]">
                          {new Date(deposit.timestamp).toLocaleTimeString(
                            "en-GB",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                    </TableCell>

                    {/* Asset */}
                    <TableCell className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              ASSET_COLORS[deposit.asset] ?? "#93A4B7",
                            boxShadow: `0 0 6px ${ASSET_COLORS[deposit.asset] ?? "#93A4B7"}80`,
                          }}
                        />
                        <span className="text-xs font-extrabold tracking-wide text-[#E6EDF3]">
                          {deposit.asset}
                        </span>
                      </div>
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="py-4 px-5">
                      <span className="text-sm font-extrabold text-[#FF8C00]">
                        £{deposit.amount.toLocaleString()}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4 px-5">
                      <StatusBadge status={deposit.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
