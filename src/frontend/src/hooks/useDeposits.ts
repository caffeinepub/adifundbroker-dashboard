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
    userPrincipal: d.userPrincipal,
  };
}

// useDeposits always fetches the caller's own deposits for the Wallet tab.
// A separate call (getAllDeposits) is used by AdminPanel for the transaction queue.
export function useDeposits(actor: backendInterface | null) {
  const [myDeposits, setMyDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDeposits = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const raw = await actor.getMyDeposits();
      setMyDeposits(raw.map(mapBackendDeposit));
    } catch (err) {
      console.error("Failed to fetch deposits:", err);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (actor) {
      fetchDeposits();
    }
  }, [actor, fetchDeposits]);

  const now = Date.now();
  const cycleStart = now - CYCLE_DAYS * 24 * 60 * 60 * 1000;
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
      // screenshotBlobId is optional -- pass undefined when not provided,
      // the backend adapter handles Candid optional encoding
      await actor.submitDeposit({
        asset,
        amount: BigInt(amount),
        txid: txid ?? "",
        screenshotBlobId: screenshotBlobId,
      });
      await fetchDeposits();
    },
    [actor, fetchDeposits],
  );

  return {
    deposits: myDeposits,
    depositsInCycle,
    remainingSlots,
    canDeposit,
    daysUntilReset,
    addDeposit,
    refreshDeposits: fetchDeposits,
    loading,
  };
}
