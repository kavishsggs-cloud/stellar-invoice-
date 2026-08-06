"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { verifyTransactionOnHorizon, savePaidOverride } from "../lib/stellar-rpc";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, Loader2, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VerifyTxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInvoiceId?: string;
  onVerified?: () => void;
}

export function VerifyTxModal({
  isOpen,
  onClose,
  initialInvoiceId = "",
  onVerified,
}: VerifyTxModalProps) {
  const [invoiceId, setInvoiceId] = useState(initialInvoiceId);
  const [txHash, setTxHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (initialInvoiceId) {
      setInvoiceId(initialInvoiceId);
    }
  }, [initialInvoiceId]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash.trim()) {
      toast.error("Please enter a valid Stellar Testnet Transaction Hash.");
      return;
    }
    if (!invoiceId.trim()) {
      toast.error("Please specify the Invoice ID to verify.");
      return;
    }

    setIsVerifying(true);
    toast.info("Querying Stellar Horizon RPC...", { description: `Tx Hash: ${txHash.slice(0, 10)}...` });

    try {
      const res = await verifyTransactionOnHorizon(txHash);

      if (res.confirmed) {
        savePaidOverride(invoiceId.trim(), txHash.trim());
        toast.success("Transaction Confirmed on Horizon Ledger!", {
          description: `Invoice #${invoiceId} status has been updated to PAID.`,
        });
        if (onVerified) onVerified();
        setTxHash("");
        onClose();
      } else {
        toast.error("Verification Failed", {
          description: res.error || "Transaction could not be confirmed on Stellar Testnet.",
        });
      }
    } catch (e: any) {
      toast.error("Horizon Query Error", {
        description: e?.message || "Failed to reach Horizon RPC server.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#011d1c]/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative z-10 w-full max-w-md bg-[#003734] border border-[#cbfffc]/20 text-[#bbc7c6] rounded-[16px] p-6 shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#bbc7c6] hover:text-[#ffffff] transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-2 text-[#cbfffc] mb-1">
              <ShieldCheck size={22} />
              <h3 className="text-xl font-medium text-[#ffffff]">
                Verify On-Chain Tx Hash
              </h3>
            </div>
            <p className="text-xs text-[#bbc7c6] mb-4">
              Input your Stellar Testnet transaction hash from Stellar Expert to instantly verify settlement against the Horizon ledger.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#edfffe] block mb-1.5">
                  Invoice ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  className="w-full bg-[#012624] border border-[#cbfffc]/15 rounded-[6px] px-3.5 py-2 text-sm text-[#ffffff] font-mono outline-none focus:border-[#cbfffc] transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#edfffe] block mb-1.5">
                  Stellar Testnet Tx Hash
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. b9f1c858d9db9d682aaf5adc254bd6c0..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full bg-[#012624] border border-[#cbfffc]/15 rounded-[6px] pl-3.5 pr-9 py-2 text-xs text-[#ffffff] font-mono outline-none focus:border-[#cbfffc] transition-all"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bbc7c6]" size={14} />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 bg-[#012624] text-[#bbc7c6] border border-[#cbfffc]/15 hover:bg-[#012624]/80 text-xs py-2 rounded-[6px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] text-[#011d1c] font-medium text-xs uppercase tracking-[0.05em] py-2 rounded-[6px] shadow-none flex items-center justify-center"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="animate-spin mr-1.5 inline text-[#011d1c]" size={14} />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-1.5 inline text-[#011d1c]" size={14} />
                      Verify Ledger
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

