import { useCallback, useState } from "react";
import type { Deposit } from "../types";
import { CYCLE_DAYS, DEPOSIT_LIMIT } from "../types";

const STORAGE_KEY = "adifundbroker_deposits";

function loadDeposits(): Deposit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Deposit[]) : [];
  } catch {
    return [];
  }
}

function saveDeposits(deposits: Deposit[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deposits));
}

export function useDeposits() {
  const [allDeposits, setAllDeposits] = useState<Deposit[]>(loadDeposits);

  const now = Date.now();
  const cycleStart = now - CYCLE_DAYS * 24 * 60 * 60 * 1000;
  const depositsInCycle = allDeposits.filter((d) => d.timestamp >= cycleStart);
  const remainingSlots = DEPOSIT_LIMIT - depositsInCycle.length;
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

  const addDeposit = useCallback((asset: string, amount: number) => {
    const newDeposit: Deposit = {
      id: `dep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      asset,
      amount,
      timestamp: Date.now(),
    };
    setAllDeposits((prev) => {
      const updated = [...prev, newDeposit];
      saveDeposits(updated);
      return updated;
    });
  }, []);

  const clearDeposits = useCallback(() => {
    setAllDeposits([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    allDeposits,
    depositsInCycle,
    remainingSlots,
    canDeposit,
    daysUntilReset,
    addDeposit,
    clearDeposits,
  };
}
