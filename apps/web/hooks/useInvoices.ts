import { useState, useEffect, useCallback, useRef } from "react";
import {
  Invoice,
  InvoiceStatus,
  InvoiceContractAPI,
  CONTRACT_ID,
  simulateContractCall,
} from "@repo/sdk";
import { logAnalyticsEvent } from "../lib/analytics";
import { toast } from "sonner";
import { isPaidOverride, queryLiveSorobanInvoiceState, savePaidOverride } from "../lib/stellar-rpc";

export const useInvoices = (address?: string | null) => {
  const [data, setData] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const previousInvoicesRef = useRef<Map<string, InvoiceStatus>>(new Map());

  const fetchInvoices = useCallback(async () => {
    if (!address) {
      setData([]);
      setIsLoading(false);
      return;
    }

    try {
      const api = new InvoiceContractAPI(CONTRACT_ID);
      const callData = api.getCallData(
        "list_invoices",
        api.listInvoicesArgs(address),
      );

      try {
        const resultVal = await simulateContractCall(address, callData);
        const parsed = api.parseInvoiceList(resultVal);

        // Fetch live on-chain Soroban state for every PENDING invoice
        const updated = await Promise.all(
          parsed.map(async (inv) => {
            const invIdStr = inv.id.toString();

            if (isPaidOverride(invIdStr)) {
              return { ...inv, status: InvoiceStatus.Paid };
            }

            if (inv.status === InvoiceStatus.Pending) {
              try {
                const liveRes = await queryLiveSorobanInvoiceState(invIdStr, address);
                if (liveRes && liveRes.invoice.status === InvoiceStatus.Paid) {
                  savePaidOverride(invIdStr, liveRes.invoice.txHash || "soroban_paid");
                  return { ...inv, status: InvoiceStatus.Paid, txHash: liveRes.invoice.txHash || inv.txHash };
                }
              } catch (e) {
                console.warn(`Failed to query live Soroban state for invoice #${invIdStr}`, e);
              }
            }

            return inv;
          })
        );

        // Check for payment transitions
        updated.forEach((inv) => {
          const invIdStr = inv.id.toString();
          const prevStatus = previousInvoicesRef.current.get(invIdStr);

          if (
            prevStatus === InvoiceStatus.Pending &&
            inv.status === InvoiceStatus.Paid
          ) {
            toast.success(`Payment Received for Invoice #${invIdStr}!`, {
              description: `Amount: ${(Number(inv.amount) / 10000000).toFixed(2)} XLM`,
            });
            logAnalyticsEvent("invoice_paid", {
              metadata: {
                invoiceId: invIdStr,
                amount: inv.amount.toString(),
                source: "external_wallet_scan",
              },
            });
          }

          previousInvoicesRef.current.set(invIdStr, inv.status);
        });

        setData(updated);
      } catch (simError) {
        console.warn(
          "Contract simulation failed, maybe not deployed?",
          simError,
        );
        setData([]);
      }
    } catch (e) {
      console.error("Failed to fetch invoices", e);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchInvoices();

    // Configure 5-second polling interval for real-time payment sync
    const intervalId = setInterval(() => {
      fetchInvoices();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchInvoices]);

  return { data, isLoading, refetch: fetchInvoices };
};

