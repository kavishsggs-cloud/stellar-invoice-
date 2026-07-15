import { useState, useEffect } from "react";
import { Invoice, InvoiceContractAPI, CONTRACT_ID, simulateContractCall } from "@repo/sdk";

export const useInvoices = (address?: string | null) => {
  const [data, setData] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setData([]);
      setIsLoading(false);
      return;
    }

    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const api = new InvoiceContractAPI(CONTRACT_ID);
        const callData = api.getCallData("list_invoices", api.listInvoicesArgs(address));
        
        try {
          // Simulate the transaction to read the state
          const resultVal = await simulateContractCall(address, callData);
          const parsed = api.parseInvoiceList(resultVal);
          setData(parsed);
        } catch (simError) {
          // If contract is not deployed or simulation fails, fallback to empty
          console.warn("Contract simulation failed, maybe not deployed?", simError);
          setData([]);
        }
      } catch (e) {
        console.error("Failed to fetch invoices", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [address]);

  const refetch = () => {
    // Basic mock refetch by copying array to trigger re-render
    setData([...data]);
  };

  return { data, isLoading, refetch };
};
