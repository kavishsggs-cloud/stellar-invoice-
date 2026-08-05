import { useState, useEffect, useCallback } from "react";
import {
  Invoice,
  InvoiceContractAPI,
  CONTRACT_ID,
  simulateContractCall,
} from "@repo/sdk";

export const useInvoices = (address?: string | null) => {
  const [data, setData] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!address) {
      setData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const api = new InvoiceContractAPI(CONTRACT_ID);
      const callData = api.getCallData(
        "list_invoices",
        api.listInvoicesArgs(address),
      );

      try {
        const resultVal = await simulateContractCall(address, callData);
        const parsed = api.parseInvoiceList(resultVal);
        setData(parsed);
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
  }, [fetchInvoices]);

  return { data, isLoading, refetch: fetchInvoices };
};
