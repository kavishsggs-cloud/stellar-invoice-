import { useState } from "react";
import { useWallet } from "./useWallet";

export type PaymentState = "idle" | "loading" | "pending" | "success" | "error";

export const usePayment = () => {
  const { signTransaction, address } = useWallet();
  const [status, setStatus] = useState<PaymentState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const payInvoice = async (invoiceId: bigint, amount: bigint, asset: string) => {
    if (!address) {
      setError("Wallet not connected");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      setError(null);
      
      // Simulate building transaction
      await new Promise(res => setTimeout(res, 500));
      const xdr = "AAAA..."; // Mock XDR
      
      setStatus("pending");
      
      // Simulate user signing
      const signedXdr = await signTransaction(xdr).catch(e => {
        throw new Error("User rejected the transaction");
      });
      
      // Simulate network submission
      setStatus("loading");
      await new Promise(res => setTimeout(res, 1500));
      
      // Update local storage to mock Soroban contract state update
      let found = false;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("invoices_")) {
          const invoices = JSON.parse(localStorage.getItem(key) || "[]");
          const idx = invoices.findIndex((inv: any) => inv.id.toString() === invoiceId.toString());
          if (idx !== -1) {
            invoices[idx].status = 1; // Paid
            invoices[idx].txHash = "mock_tx_hash_" + Date.now();
            invoices[idx].updatedAt = Date.now();
            localStorage.setItem(key, JSON.stringify(invoices));
            found = true;
            break;
          }
        }
      }
      
      setStatus("success");
      setTxHash("mock_tx_hash_" + Date.now());
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Payment failed");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setError(null);
    setTxHash(null);
  };

  return {
    status,
    error,
    txHash,
    payInvoice,
    reset,
  };
};
