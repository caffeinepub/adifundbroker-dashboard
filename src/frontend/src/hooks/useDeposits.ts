import { useCallback, useEffect, useState } from "react";
import type { DepositOutput, backendInterface } from "../backend.d";
import type { Deposit } from "../types";
import { CYCLE_DAYS, DEPOSIT_LIMIT } from "../types";

function mapBackendDeposit(d: DepositOutput): Deposit {
  let status: Deposit["status"] = "Pending";
  if ((d.status as unknown as string) === "verified") status = "Verified";
  else if ((d.status as unknown as string) === "rejected") status = "Rejected";
  else if ((d.status as unknown as string) === "pending") status = "Pending";

  return {
    id: d.id.toString(),
    asset: d.asset,
    amount: Number(d.amount),
    timestamp: Number(d.timestamp) / 1_000_000, // nanoseconds to ms
    status,
    txid: d.txid,
    screenshotBlobId: d.screenshotBlobId ?? undefined,
  };
}

export function useDeposits(actor: backendInterface | null, isAdmin: boolean) {
  const [allDeposits, setAllDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDeposits = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      let raw: DepositOutput[];
      if (isAdmin) {
        raw = await actor.getAllDeposits();
      } else {
        raw = await actor.getMyDeposits();
      }
      setAllDeposits(raw.map(mapBackendDeposit));
    } catch (err) {
      console.error("Failed to fetch deposits:", err);
    } finally {
      setLoading(false);
    }
  }, [actor, isAdmin]);

  useEffect(() => {
    if (actor) {
      fetchDeposits();
    }
  }, [actor, fetchDeposits]);

  const now = Date.now();
  const cycleStart = now - CYCLE_DAYS * 24 * 60 * 60 * 1000;
  const myDeposits = allDeposits.filter((d) => !isAdmin || d.timestamp >= 0);
  const depositsInCycle = myDeposits.filter((d) => d.timestamp >= cycleStart);
  const remainingSlots = Math.max(0, DEPOSIT_LIMIT - depositsInCycle.length);
  const canDeposit = remainingSlots > 0;

  const daysUntilReset =
    depositsInCycle.length > 0
      ? Math.ceil(
          (depositsInCycle[0].timestamp +
            CYCLE_DAYS * 24 * 60 * 60 * 1000 -
            now) /
            (24 * 60 * 60 * 1000),
        )
      : CYCLE_DAYS;

  const addDeposit = useCallback(
    async (
      asset: string,
      amount: number,
      txid?: string,
      screenshotBlobId?: string,
    ) => {
      if (!actor) return;
      await actor.submitDeposit({
        asset,
        amount: BigInt(amount),
        txid: txid ?? "",
        screenshotBlobId: screenshotBlobId ?? undefined,
      });
      await fetchDeposits();
    },
    [actor, fetchDeposits],
  );

  return {
    allDeposits: isAdmin ? allDeposits : myDeposits,
    depositsInCycle,
    remainingSlots,
    canDeposit,
    daysUntilReset,
    addDeposit,
    refreshDeposits: fetchDeposits,
    loading,
  };
}
