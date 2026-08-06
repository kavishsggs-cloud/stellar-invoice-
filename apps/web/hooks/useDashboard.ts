import { useMemo, useEffect } from "react";
import { InvoiceStatus } from "@repo/sdk";
import { useInvoices } from "./useInvoices";
import { useWallet } from "./useWallet";

export const useDashboard = () => {
  const { address } = useWallet();
  const { data: invoices, isLoading, refetch } = useInvoices(address);

  useEffect(() => {
    const handleEvent = () => refetch();
    window.addEventListener("invoice-paid", handleEvent);
    window.addEventListener("storage", handleEvent);
    return () => {
      window.removeEventListener("invoice-paid", handleEvent);
      window.removeEventListener("storage", handleEvent);
    };
  }, [refetch]);

  const metrics = useMemo(() => {
    if (!invoices) return null;

    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(
      (i) => i.status === InvoiceStatus.Paid,
    );
    const pendingInvoices = invoices.filter(
      (i) => i.status === InvoiceStatus.Pending,
    );
    const cancelledInvoices = invoices.filter(
      (i) => i.status === InvoiceStatus.Cancelled,
    );

    const totalRevenue = paidInvoices.reduce(
      (acc, curr) => acc + Number(curr.amount) / 10000000,
      0,
    );

    return {
      totalInvoices,
      paidCount: paidInvoices.length,
      pendingCount: pendingInvoices.length,
      cancelledCount: cancelledInvoices.length,
      totalRevenue,
    };
  }, [invoices]);

  return {
    invoices,
    metrics,
    isLoading,
    refetch,
  };
};
