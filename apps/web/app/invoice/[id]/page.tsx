"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { InvoiceStatus } from "@repo/sdk";
import { useWallet } from "../../../hooks/useWallet";
import { usePayment } from "../../../hooks/usePayment";
import { useExplorer } from "../../../hooks/useExplorer";
import { useInvoice } from "../../../hooks/useInvoice";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle2,
  Loader2,
  Wallet,
  ExternalLink,
  AlertCircle,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { address, connect } = useWallet();
  const { status, error, txHash, payInvoice } = usePayment();
  const { getTransactionUrl, getAccountUrl } = useExplorer();
  const [internalStep, setInternalStep] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  const {
    data: invoice,
    isLoading,
    error: fetchError,
    refetch,
  } = useInvoice(id);

  useEffect(() => {
    if (error) toast.error(error);
    if (fetchError) toast.error(fetchError);
  }, [error, fetchError]);

  useEffect(() => {
    if (status === "loading" && internalStep === 0) {
      setInternalStep(1);
    } else if (status === "pending") {
      setInternalStep(2);
    } else if (status === "loading" && internalStep === 2) {
      setInternalStep(3);
    } else if (status === "success") {
      setInternalStep(4);
      refetch();
    } else if (status === "idle" || status === "error") {
      setInternalStep(0);
    }
  }, [status, internalStep, refetch]);

  // Handle external or direct payment settlement auto-redirection
  useEffect(() => {
    if (invoice && invoice.status === InvoiceStatus.Paid && !hasRedirected) {
      setHasRedirected(true);
      setIsRedirecting(true);
      toast.success("Payment Confirmed on Stellar Testnet!", {
        description: `Invoice #${id} has been settled. Redirecting to Dashboard...`,
      });

      const timer = setTimeout(() => {
        router.push(`/dashboard?payment=success&id=${invoice.id.toString()}`);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [invoice, hasRedirected, id, router]);

  const handlePay = async () => {
    if (!invoice) return;
    if (!address) {
      await connect();
      return;
    }
    await payInvoice(BigInt(invoice.id));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#012624] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#cbfffc]" size={40} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#012624] flex flex-col items-center justify-center p-4 text-center text-[#bbc7c6]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-[#011d1c] rounded-full flex items-center justify-center mb-6 border border-red-500/30">
            <AlertCircle className="text-red-400" size={40} />
          </div>
          <h1 className="text-[36px] font-medium text-[#ffffff] mb-3">
            Invoice Not Found
          </h1>
          <p className="text-[#bbc7c6] max-w-md">
            The invoice you are looking for does not exist, has been removed, or
            is not available on this network.
          </p>
        </motion.div>
      </div>
    );
  }

  const isPaid = invoice.status === InvoiceStatus.Paid;
  const isCancelled = invoice.status === InvoiceStatus.Cancelled;
  const amountXLM = (Number(invoice.amount) / 10000000).toFixed(2);
  const paymentUri = `web+stellar:pay?destination=${invoice.creator}&amount=${amountXLM}&asset_code=XLM&memo=${encodeURIComponent(invoice.memo || `INV-${invoice.id}`)}`;

  return (
    <div className="min-h-screen bg-[#012624] text-[#bbc7c6] py-12 px-4 sm:px-6 relative overflow-hidden flex items-center justify-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl w-full relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[16px] bg-[#003734] mb-4 border border-[#cbfffc]/20">
            <Wallet className="text-[#cbfffc]" size={32} />
          </div>
          <h1 className="text-[36px] font-medium text-[#ffffff] tracking-[-0.03em]">
            On-Chain Settlement
          </h1>
          <p className="text-[#bbc7c6] mt-1 font-normal text-base">
            Secure payment request on Stellar network
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-[#003734] rounded-[16px] border border-[#cbfffc]/10 shadow-none overflow-hidden">
            {/* Upper Status Banner */}
            <div
              className={`px-8 py-5 flex items-center justify-between border-b border-[#cbfffc]/10 bg-[#012624]`}
            >
              <div className="flex items-center space-x-3">
                {isPaid ? (
                  <CheckCircle2 className="text-[#cbfffc]" size={24} />
                ) : isCancelled ? (
                  <AlertCircle className="text-[#707777]" size={24} />
                ) : (
                  <Clock className="text-[#edfffe]" size={24} />
                )}
                <span
                  className={`text-base font-medium uppercase tracking-[0.1em] ${
                    isPaid
                      ? "text-[#cbfffc]"
                      : isCancelled
                        ? "text-[#707777]"
                        : "text-[#edfffe]"
                  }`}
                >
                  {InvoiceStatus[invoice.status].toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-[#bbc7c6] uppercase tracking-[0.1em]">
                  INV ID
                </span>
                <span className="text-sm font-mono text-[#ffffff] bg-[#003734] border border-[#cbfffc]/15 px-3 py-1 rounded-[6px]">
                  {invoice.id.toString().slice(-6)}
                </span>
              </div>
            </div>

            <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-12 relative">
              {/* Overlay for Live Payment Status Timeline */}
              <AnimatePresence>
                {((status !== "idle" && status !== "error") || isRedirecting) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-40 bg-[#011d1c]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="w-full max-w-sm space-y-8">
                      {isRedirecting || status === "success" ? (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-[#003734] border border-[#cbfffc]/40 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(203,255,252,0.35)]">
                            <CheckCircle2
                              className="text-[#cbfffc] animate-bounce"
                              size={44}
                            />
                          </div>
                          <h3 className="text-xl font-medium text-[#ffffff] flex items-center gap-2">
                            Payment Confirmed <Sparkles size={18} className="text-[#cbfffc]" />
                          </h3>
                          <p className="text-xs text-[#cbfffc] mt-1 font-mono">
                            Settled on Stellar Testnet • Redirecting to Dashboard...
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Loader2
                            className="animate-spin text-[#cbfffc] mb-4"
                            size={40}
                          />
                          <h3 className="text-xl font-medium text-[#ffffff]">
                            Executing Settle Logic
                          </h3>
                        </div>
                      )}

                      {/* Transaction Flow Milestones */}
                      <div className="space-y-4 text-left text-sm font-normal">
                        <div className="flex items-center justify-between">
                          <span
                            className={
                              internalStep >= 1
                                ? "text-[#ffffff] font-medium"
                                : "text-[#bbc7c6]"
                            }
                          >
                            1. Build Transaction
                          </span>
                          {internalStep > 1 ? (
                            <CheckCircle2
                              size={16}
                              className="text-[#cbfffc]"
                            />
                          ) : (
                            <Clock size={16} className="text-[#bbc7c6]" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={
                              internalStep >= 2
                                ? "text-[#ffffff] font-medium"
                                : "text-[#bbc7c6]"
                            }
                          >
                            2. Awaiting Wallet Sign
                          </span>
                          {internalStep > 2 ? (
                            <CheckCircle2
                              size={16}
                              className="text-[#cbfffc]"
                            />
                          ) : (
                            <Clock size={16} className="text-[#bbc7c6]" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={
                              internalStep >= 3
                                ? "text-[#ffffff] font-medium"
                                : "text-[#bbc7c6]"
                            }
                          >
                            3. Submit XDR to Stellar
                          </span>
                          {internalStep > 3 ? (
                            <CheckCircle2
                              size={16}
                              className="text-[#cbfffc]"
                            />
                          ) : (
                            <Clock size={16} className="text-[#bbc7c6]" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={
                              internalStep >= 4
                                ? "text-[#ffffff] font-medium"
                                : "text-[#bbc7c6]"
                            }
                          >
                            4. Ledger Confirmation
                          </span>
                          {internalStep >= 4 ? (
                            <CheckCircle2
                              size={16}
                              className="text-[#cbfffc]"
                            />
                          ) : (
                            <Clock size={16} className="text-[#bbc7c6]" />
                          )}
                        </div>
                      </div>

                      {txHash && (
                        <div className="p-3 bg-[#012624] border border-[#cbfffc]/15 rounded-[6px] flex items-center justify-between text-xs font-mono">
                          <span className="truncate w-44">{txHash}</span>
                          <a
                            href={getTransactionUrl(txHash)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#cbfffc] flex items-center hover:underline"
                          >
                            Explorer
                            <ExternalLink size={12} className="ml-1 inline" />
                          </a>
                        </div>
                      )}

                      {status === "success" && (
                        <Button
                          className="w-full mt-4 bg-[#012624] text-[#ffffff] font-medium text-[13px] uppercase tracking-[0.05em] rounded-[6px] px-6 py-2.5 hover:bg-[#012624]/80 border border-[#cbfffc]/15 shadow-none"
                          onClick={() => window.location.reload()}
                        >
                          Return to Invoice
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Left Column: Details */}
              <div className="flex-1 space-y-8">
                <div>
                  <p className="text-[#edfffe] text-[11px] uppercase tracking-[0.1em] font-medium">
                    Total Amount Due
                  </p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-[86px] font-medium leading-[1.0] text-[#fde9ff] font-['Matter',sans-serif]">
                      {amountXLM}
                    </span>
                    <span className="text-2xl text-[#cbfffc] font-medium">
                      XLM
                    </span>
                  </div>
                </div>

                <div className="space-y-6 text-xs sm:text-sm">
                  {invoice.description && (
                    <div className="pb-4 border-b border-[#cbfffc]/10">
                      <p className="text-[#edfffe] text-[11px] uppercase tracking-[0.1em] mb-1 font-medium">
                        Description
                      </p>
                      <p className="text-[#ffffff] font-normal text-base">
                        {invoice.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-[#cbfffc]/10">
                    <div className="bg-[#012624] p-4 rounded-[12px] border border-[#cbfffc]/10">
                      <p className="text-[#edfffe] text-[11px] uppercase tracking-[0.1em] mb-2 font-medium">
                        From Issuer
                      </p>
                      <a
                        href={getAccountUrl(invoice.creator)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center text-[#cbfffc] hover:text-[#ffffff] transition-colors font-mono text-xs truncate"
                      >
                        {invoice.creator.slice(0, 8)}...
                        {invoice.creator.slice(-6)}
                        <ExternalLink size={12} className="ml-1.5 inline" />
                      </a>
                    </div>

                    <div className="bg-[#012624] p-4 rounded-[12px] border border-[#cbfffc]/10">
                      <p className="text-[#edfffe] text-[11px] uppercase tracking-[0.1em] mb-2 font-medium">
                        To Client
                      </p>
                      <p className="text-[#ffffff] font-medium truncate">
                        {invoice.clientName || "Unknown Client"}
                      </p>
                      <a
                        href={getAccountUrl(invoice.recipient)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center text-[#cbfffc] hover:text-[#ffffff] transition-colors font-mono text-[10px] truncate mt-1"
                      >
                        {invoice.recipient.slice(0, 8)}...
                        {invoice.recipient.slice(-6)}
                        <ExternalLink size={10} className="ml-1 inline" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pb-4 border-b border-[#cbfffc]/10">
                    <div>
                      <p className="text-[#edfffe] text-[11px] uppercase tracking-[0.1em] mb-1 font-medium">
                        Due Date
                      </p>
                      <div className="flex items-center text-[#ffffff] font-normal">
                        <Calendar size={14} className="mr-1.5 text-[#cbfffc]" />
                        {invoice.dueDate
                          ? new Date(
                              Number(invoice.dueDate),
                            ).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </div>
                    </div>
                    <div>
                      <p className="text-[#edfffe] text-[11px] uppercase tracking-[0.1em] mb-1 font-medium">
                        Stellar Memo
                      </p>
                      <p className="text-[#ffffff] font-mono bg-[#012624] border border-[#cbfffc]/15 px-2.5 py-0.5 rounded-[4px] inline-block">
                        {invoice.memo || "None"}
                      </p>
                    </div>
                  </div>

                  {invoice.notes && (
                    <div>
                      <p className="text-[#edfffe] text-[11px] uppercase tracking-[0.1em] mb-1 font-medium">
                        Notes
                      </p>
                      <p className="text-[#bbc7c6] italic">
                        &quot;{invoice.notes}&quot;
                      </p>
                    </div>
                  )}

                  {invoice.txHash && (
                    <div className="bg-[#012624] rounded-[12px] p-4 border border-[#cbfffc]/10 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[#edfffe] uppercase tracking-[0.1em] text-[10px] font-medium mb-1">
                          Transaction Link
                        </p>
                        <p className="font-mono text-[#bbc7c6] truncate w-32 sm:w-60">
                          {invoice.txHash}
                        </p>
                      </div>
                      <a
                        href={getTransactionUrl(invoice.txHash)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button className="bg-[#003734] text-[#ffffff] font-medium text-[12px] uppercase tracking-[0.05em] rounded-[6px] px-3.5 py-1.5 hover:bg-[#003734]/80 border border-[#cbfffc]/15 shadow-none">
                          View
                          <ExternalLink size={12} className="ml-1 inline" />
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: QR Code & Wallet Actions */}
              <div className="w-full lg:w-72 flex flex-col items-center justify-start space-y-6 lg:border-l border-[#cbfffc]/10 lg:pl-8 pt-8 lg:pt-0 border-t lg:border-t-0">
                {!isPaid && !isCancelled ? (
                  <>
                    <div className="text-center w-full">
                      <h3 className="text-base font-medium text-[#ffffff] mb-1">
                        SEP-0007 QR Settle
                      </h3>
                      <p className="text-xs text-[#bbc7c6]">
                        Scan with dynamic Stellar wallets like LOBSTR or
                        Vibrant.
                      </p>
                    </div>

                    <div className="bg-[#ffffff] p-4 rounded-[12px] shadow-none">
                      <QRCodeSVG value={paymentUri} size={180} level="H" />
                    </div>

                    <div className="w-full flex items-center gap-3">
                      <div className="h-px flex-1 bg-[#cbfffc]/10" />
                      <span className="text-[10px] text-[#bbc7c6] font-medium tracking-[0.12em]">
                        OR
                      </span>
                      <div className="h-px flex-1 bg-[#cbfffc]/10" />
                    </div>

                    <div className="w-full space-y-3">
                      <Button
                        onClick={handlePay}
                        disabled={status === "loading" || status === "pending"}
                        className="w-full bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] text-[#011d1c] font-medium text-[14px] uppercase tracking-[0.05em] rounded-[6px] px-6 py-3.5 hover:opacity-90 shadow-none border-0 flex items-center justify-center"
                      >
                        {status === "loading" ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : status === "pending" ? (
                          <span>Sign Wallet payload...</span>
                        ) : (
                          <>
                            <Wallet size={16} className="mr-1.5 inline" />
                            <span>
                              {address
                                ? "Pay with Freighter"
                                : "Connect Wallet"}
                            </span>
                          </>
                        )}
                      </Button>

                      {address && (
                        <div className="bg-[#012624] border border-[#cbfffc]/15 rounded-[6px] p-2.5 text-center text-xs text-[#bbc7c6] font-mono">
                          Connected: {address.slice(0, 5)}...{address.slice(-4)}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4 py-16 text-center">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center border ${
                        isPaid
                          ? "bg-[#012624] border-[#cbfffc]/30 text-[#cbfffc]"
                          : "bg-[#011d1c] border-[#707777]/30 text-[#707777]"
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 size={36} className="animate-bounce" />
                      ) : (
                        <AlertCircle size={36} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-[#ffffff] text-lg">
                        {isPaid ? "Settle complete" : "Request Cancelled"}
                      </h4>
                      <p className="text-xs text-[#bbc7c6] mt-1">
                        {isPaid
                          ? "Thank you for your business."
                          : "This invoice is no longer valid."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
