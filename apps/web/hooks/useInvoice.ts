import { useState, useEffect } from "react";
import { Invoice } from "@repo/sdk";

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
        // Mock fetch across all local storage users to find the invoice
        let foundInvoice: Invoice | null = null;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith("invoices_")) {
            const invoices = JSON.parse(localStorage.getItem(key) || "[]");
            const match = invoices.find((inv: any) => inv.id.toString() === id);
            if (match) {
              foundInvoice = {
                ...match,
                id: BigInt(match.id),
                amount: BigInt(match.amount),
                dueDate: BigInt(match.dueDate),
                createdAt: BigInt(match.createdAt),
                updatedAt: BigInt(match.updatedAt),
              };
              break;
            }
          }
        }

        if (foundInvoice) {
          setData(foundInvoice);
        } else {
          setError("Invoice not found");
        }
      } catch (e) {
        setError("Failed to load invoice");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  return { data, isLoading, error };
};
