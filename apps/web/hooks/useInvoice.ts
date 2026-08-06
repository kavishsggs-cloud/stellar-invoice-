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
import { isPaidOverride, queryLiveSorobanInvoiceState } from "../lib/stellar-rpc";

export const useInvoice = (id: string | null) => {
  const [data, setData] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevStatusRef = useRef<InvoiceStatus | null>(null);

  const fetchInvoice = useCallback(async () => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setError(null);
    try {
      let parsed: Invoice | null = null;

      try {
        const api = new InvoiceContractAPI(CONTRACT_ID);
        const callData = api.getCallData(
          "get_invoice",
          api.getInvoiceArgs(BigInt(id)),
        );
        const dummySource =
          "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
        const resultVal = await simulateContractCall(dummySource, callData);
        parsed = api.parseInvoice(resultVal);
      } catch {
        // Fallback to un-cached multi-contract live query
        const liveRes = await queryLiveSorobanInvoiceState(id);
        if (liveRes) {
          parsed = liveRes.invoice;
        }
      }

      if (!parsed) {
        // Retry live query one more time
        const liveRes = await queryLiveSorobanInvoiceState(id);
        if (liveRes) {
          parsed = liveRes.invoice;
        }
      }

      if (parsed) {
        if (isPaidOverride(id) && parsed.status !== InvoiceStatus.Paid) {
          parsed = { ...parsed, status: InvoiceStatus.Paid };
        }

        if (
          prevStatusRef.current === InvoiceStatus.Pending &&
          parsed.status === InvoiceStatus.Paid
        ) {
          toast.success("Payment Confirmed On-Chain!", {
            description: `Invoice #${id} has been settled.`,
          });
          logAnalyticsEvent("invoice_paid", {
            metadata: {
              invoiceId: id,
              amount: parsed.amount.toString(),
              source: "payment_page_poll",
            },
          });
        }

        prevStatusRef.current = parsed.status;
        setData(parsed);
      } else {
        setError("Invoice not found on Soroban RPC");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load invoice");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();

    // Poll every 3 seconds if invoice is currently Pending
    const intervalId = setInterval(() => {
      if (prevStatusRef.current === InvoiceStatus.Pending) {
        fetchInvoice();
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [fetchInvoice]);

  return { data, isLoading, error, refetch: fetchInvoice };
};

