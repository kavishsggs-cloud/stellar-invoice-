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
      const api = new InvoiceContractAPI(CONTRACT_ID);
      const callData = api.getCallData(
        "get_invoice",
        api.getInvoiceArgs(BigInt(id)),
      );

      try {
        const dummySource =
          "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
        const resultVal = await simulateContractCall(dummySource, callData);
        const parsed = api.parseInvoice(resultVal);

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
      } catch (simError) {
        console.warn(
          "Contract simulation failed, maybe not deployed or invoice not found?",
          simError,
        );
        setError("Invoice not found or contract not deployed");
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

    // Poll every 4 seconds if invoice is currently Pending
    const intervalId = setInterval(() => {
      if (prevStatusRef.current === InvoiceStatus.Pending) {
        fetchInvoice();
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [fetchInvoice]);

  return { data, isLoading, error, refetch: fetchInvoice };
};

