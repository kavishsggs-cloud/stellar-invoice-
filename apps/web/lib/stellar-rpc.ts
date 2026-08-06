import { InvoiceContractAPI, InvoiceStatus, CONTRACT_ID, simulateContractCall } from "@repo/sdk";

export const KNOWN_CONTRACT_IDS = [
  CONTRACT_ID,
  "CAKQKXMLUDZ2QJFSKUVOE3TZLKQWA3KOQYJ7EG73YKPSMJ4U5YZSO5TW",
  "CBPNGAIA64YE7TEQIBWYVQPMOFITNK3LRXZVPATUJA63PR364KNCTVEO",
];

const PAID_OVERRIDES_KEY = "stellar_paid_overrides_v1";

export interface PaidOverride {
  invoiceId: string;
  txHash: string;
  timestamp: number;
}

export function getPaidOverrides(): Record<string, PaidOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PAID_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function savePaidOverride(invoiceId: string, txHash: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getPaidOverrides();
    current[invoiceId] = {
      invoiceId,
      txHash,
      timestamp: Date.now(),
    };
    localStorage.setItem(PAID_OVERRIDES_KEY, JSON.stringify(current));
  } catch (e) {
    console.error("Failed to save paid override", e);
  }
}

export function isPaidOverride(invoiceId: string): boolean {
  const overrides = getPaidOverrides();
  return Boolean(overrides[invoiceId]);
}

/**
 * Directly queries Horizon RPC to verify a transaction hash.
 */
export async function verifyTransactionOnHorizon(txHash: string): Promise<{
  confirmed: boolean;
  memo?: string;
  operations?: any[];
  error?: string;
}> {
  const cleanHash = txHash.trim();
  if (!cleanHash) {
    return { confirmed: false, error: "Transaction hash cannot be empty." };
  }

  try {
    const txRes = await fetch(`https://horizon-testnet.stellar.org/transactions/${cleanHash}`, {
      cache: "no-store",
    });

    if (!txRes.ok) {
      if (txRes.status === 404) {
        return { confirmed: false, error: "Transaction hash not found on Stellar Testnet Horizon RPC." };
      }
      return { confirmed: false, error: `Horizon RPC returned status ${txRes.status}` };
    }

    const txData = await txRes.json();
    if (txData.successful === true) {
      const opsRes = await fetch(`https://horizon-testnet.stellar.org/transactions/${cleanHash}/operations`, {
        cache: "no-store",
      });
      const opsData = opsRes.ok ? await opsRes.json() : null;

      return {
        confirmed: true,
        memo: txData.memo || txData.memo_bytes || undefined,
        operations: opsData ? opsData._embedded?.records : [],
      };
    } else {
      return { confirmed: false, error: "Transaction failed on Stellar ledger." };
    }
  } catch (e: any) {
    return { confirmed: false, error: e?.message || "Failed to reach Stellar Horizon RPC." };
  }
}

/**
 * Un-cached direct Soroban RPC state query for a single invoice across contract deployments.
 */
export async function queryLiveSorobanInvoiceState(
  invoiceId: string,
  callerAddress = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
) {
  for (const contractId of KNOWN_CONTRACT_IDS) {
    try {
      const api = new InvoiceContractAPI(contractId);
      const callData = api.getCallData("get_invoice", api.getInvoiceArgs(BigInt(invoiceId)));
      const resultVal = await simulateContractCall(callerAddress, callData);
      const parsed = api.parseInvoice(resultVal);

      if (parsed) {
        return { invoice: parsed, contractId };
      }
    } catch (e) {
      // Try next contract ID if any
    }
  }
  return null;
}
