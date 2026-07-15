import { useState, useEffect } from "react";
import { Invoice, InvoiceContractAPI, CONTRACT_ID, simulateContractCall } from "@repo/sdk";

export const useInvoice = (id: string | null) => {
  const [data, setData] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const api = new InvoiceContractAPI(CONTRACT_ID);
        const callData = api.getCallData("get_invoice", api.getInvoiceArgs(BigInt(id)));
        
        try {
          // We need a dummy source address for simulation. In practice, anyone can read.
          const dummySource = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
          const resultVal = await simulateContractCall(dummySource, callData);
          const parsed = api.parseInvoice(resultVal);
          setData(parsed);
        } catch (simError: any) {
          console.warn("Contract simulation failed, maybe not deployed or invoice not found?", simError);
          setError("Invoice not found or contract not deployed");
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load invoice");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  return { data, isLoading, error };
};
