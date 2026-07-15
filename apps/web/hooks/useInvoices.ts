import { useState, useEffect } from "react";
import { Invoice, InvoiceStatus } from "@repo/sdk";

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
        // In a real environment, we'd use InvoiceContractAPI to fetch from Soroban RPC.
        // For this MVP, we simulate fetching user's invoices from local storage or mock.
        const storedInvoices = localStorage.getItem(`invoices_${address}`);
        if (storedInvoices) {
          // Parse JSON, converting string dates/numbers back to proper types if needed
          const parsed = JSON.parse(storedInvoices).map((inv: any) => ({
            ...inv,
            id: BigInt(inv.id),
            amount: BigInt(inv.amount),
            dueDate: BigInt(inv.dueDate),
            createdAt: BigInt(inv.createdAt),
            updatedAt: BigInt(inv.updatedAt),
          }));
          setData(parsed);
        } else {
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

  return { data, isLoading, refetch: () => setData([...data]) }; // simple refetch mock
};
