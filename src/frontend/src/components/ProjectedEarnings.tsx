import { useState } from "react";
import type { Deposit } from "../types";
import { ROI_RATES } from "../types";

interface ProjectedEarningsProps {
  deposits: Deposit[];
}

export default function ProjectedEarnings({
  deposits,
}: ProjectedEarningsProps) {
  const [days, setDays] = useState(30);

  const depositRows = deposits.slice(0, 3).map((dep, i) => {
    const roi = ROI_RATES[i] ?? 0;
    const daily = dep.amount * roi;
    return {
      ...dep,
      roi,
      roiLabel: `${(roi * 100).toFixed(0)}%`,
      daily,
      total: daily * days,
    };
  });

  const aggregateRoi = ROI_RATES.slice(0, deposits.length).reduce(
    (s, r) => s + r,
    0,
  );
  const aggregateRoiLabel = `${(aggregateRoi * 100).toFixed(0)}%`;
  const totalDaily = depositRows.reduce((s, r) => s + r.daily, 0);
  const totalProjected = totalDaily * days;

  return (
    <div className="cyber-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="card-heading text-[#FF8C00]">PROJECTED EARNINGS</h2>
        <div className="flex items-center gap-2">
          <label
            htmlFor="simulate-days"
            className="text-[10px] font-bold tracking-widest uppercase text-[#93A4B7]"
          >
            DAYS
          </label>
          <input
            id="simulate-days"
            data-ocid="earnings.simulate.input"
            type="number"
            min={1}
            max={365}
            value={days}
            onChange={(e) =>
              setDays(Math.max(1, Math.min(365, Number(e.target.value))))
            }
            className="w-16 text-center bg-[#0B0F14] border border-[#FF8C00]/30 rounded-lg px-2 py-1 text-sm font-mono text-[#FF8C00] focus:outline-none focus:border-[#FF8C00]/70"
          />
        </div>
      </div>

      <div className="bg-[#0B0F14] rounded-lg px-3 py-2 mb-4 text-[10px] text-[#6B7C8F] font-mono leading-relaxed">
        ROI rates: Deposit 1: <span className="text-[#22C55E]">2%</span> │
        Deposit 2: <span className="text-[#22C55E]">+3%</span> │ Deposit 3:{" "}
        <span className="text-[#22C55E]">+1%</span>{" "}
        <span className="text-[#FF8C00]">(6% aggregate)</span>
      </div>

      {deposits.length === 0 ? (
        <div
          data-ocid="earnings.empty_state"
          className="text-center py-6 text-[#6B7C8F] text-sm"
        >
          <p>No deposits to project earnings from.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[9px] font-bold tracking-[0.12em] text-[#6B7C8F] uppercase border-b border-white/5">
                  <th className="pb-2 text-left">DEPOSIT</th>
                  <th className="pb-2 text-right">AMOUNT</th>
                  <th className="pb-2 text-right">ROI%</th>
                  <th className="pb-2 text-right">DAILY</th>
                  <th className="pb-2 text-right">{days}D PROJ.</th>
                </tr>
              </thead>
              <tbody>
                {depositRows.map((row, i) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/5"
                    data-ocid={`earnings.row.item.${i + 1}`}
                  >
                    <td className="py-2 text-[#93A4B7] font-bold">
                      {row.asset} #{i + 1}
                    </td>
                    <td className="py-2 text-right font-mono text-[#E6EDF3]">
                      £{row.amount.toLocaleString()}
                    </td>
                    <td className="py-2 text-right">
                      <span className="text-[#22C55E] font-bold">
                        {row.roiLabel}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono text-[#22C55E]">
                      £{row.daily.toFixed(2)}
                    </td>
                    <td className="py-2 text-right font-mono text-[#FF8C00] font-bold">
                      £{row.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#FF8C00]/30">
                  <td
                    className="pt-2 font-bold text-[#FF8C00] uppercase tracking-wide"
                    colSpan={2}
                  >
                    AGGREGATE
                    <span className="ml-1 text-[9px] text-[#22C55E]">
                      {aggregateRoiLabel}/day
                    </span>
                  </td>
                  <td className="pt-2 text-right font-mono text-[#E6EDF3]" />
                  <td className="pt-2 text-right font-mono text-[#22C55E] font-bold">
                    £{totalDaily.toFixed(2)}
                  </td>
                  <td className="pt-2 text-right font-mono text-[#FF8C00] font-extrabold text-sm">
                    £{totalProjected.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              {
                label: "DAILY",
                value: `£${totalDaily.toFixed(2)}`,
                color: "#22C55E",
              },
              {
                label: "WEEKLY",
                value: `£${(totalDaily * 7).toFixed(2)}`,
                color: "#3B82F6",
              },
              {
                label: "MONTHLY",
                value: `£${(totalDaily * 30).toFixed(2)}`,
                color: "#FF8C00",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-[#0B0F14] rounded-lg p-2 text-center border border-white/5"
              >
                <div
                  className="text-[9px] font-bold tracking-widest uppercase mb-1"
                  style={{ color: s.color }}
                >
                  {s.label}
                </div>
                <div
                  className="text-sm font-extrabold font-mono"
                  style={{ color: s.color }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
