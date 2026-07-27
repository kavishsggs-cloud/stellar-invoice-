"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { InvoiceStatus } from "@repo/sdk";
import { useWallet } from "../../../hooks/useWallet";
import { usePayment } from "../../../hooks/usePayment";
import { useExplorer } from "../../../hooks/useExplorer";
import { useInvoice } from "../../../hooks/useInvoice";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, Loader2, Wallet, ExternalLink, AlertCircle, Calendar, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

export default function InvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const { address, connect } = useWallet();
  const { status, error, txHash, payInvoice } = usePayment();
  const { getTransactionUrl, getAccountUrl } = useExplorer();
  const [internalStep, setInternalStep] = useState(0);

  const { data: invoice, isLoading, error: fetchError } = useInvoice(id);

  // Handle error messages
  useEffect(() => {
    if (error) toast.error(error);
    if (fetchError) toast.error(fetchError);
  }, [error, fetchError]);

  // Sync internal progress step with usePayment status
  useEffect(() => {
    if (status === "loading" && internalStep === 0) {
      setInternalStep(1); // Building transaction payload
    } else if (status === "pending") {
      setInternalStep(2); // Awaiting signature approval
    } else if (status === "loading" && internalStep === 2) {
      setInternalStep(3); // Broadcasting transaction XDR
    } else if (status === "success") {
      setInternalStep(4); // Confirmed on-chain
    } else if (status === "idle" || status === "error") {
      setInternalStep(0);
    }
  }, [status, internalStep]);

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
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-stellar-blue" size={40} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
          <div className="w-20 h-20 bg-danger/20 rounded-full flex items-center justify-center mb-6 border border-danger/30 shadow-lg">
            <AlertCircle className="text-danger" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Invoice Not Found</h1>
          <p className="text-text-secondary max-w-md">The invoice you are looking for does not exist, has been removed, or is not available on this network.</p>
        </motion.div>
      </div>
    );
  }

  const isPaid = invoice.status === InvoiceStatus.Paid;
  const isCancelled = invoice.status === InvoiceStatus.Cancelled;
  const amountXLM = (Number(invoice.amount) / 10000000).toFixed(2);
  const paymentUri = `web+stellar:pay?destination=${invoice.creator}&amount=${amountXLM}&asset_code=XLM&memo=${encodeURIComponent(invoice.memo || `INV-${invoice.id}`)}`;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 relative overflow-hidden flex items-center justify-center">
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl w-full relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stellar-blue/10 mb-4 border border-stellar-blue/20 shadow-[0_0_30px_rgba(8,181,229,0.2)]">
            <Wallet className="text-stellar-blue animate-pulse" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">On-Chain Settlement</h1>
          <p className="text-text-secondary mt-1 font-light">Secure payment request on Stellar network</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card variant="glass" padding="none" className="overflow-hidden border-white/10 shadow-2xl">
            
            {/* Upper Status Banner */}
            <div className={`px-8 py-5 flex items-center justify-between border-b border-white/5 ${
              isPaid ? 'bg-success/10 border-success/15' : 
              isCancelled ? 'bg-danger/10 border-danger/15' : 
              'bg-surface/50'
            }`}>
              <div className="flex items-center space-x-3">
                {isPaid ? <CheckCircle2 className="text-success animate-bounce" size={24} /> :
                 isCancelled ? <AlertCircle className="text-danger" size={24} /> :
                 <Clock className="text-warning animate-spin-slow" size={24} />}
                <span className={`text-lg font-bold uppercase tracking-wider ${
                  isPaid ? 'text-success' : 
                  isCancelled ? 'text-danger' : 
                  'text-warning'
                }`}>
                  {InvoiceStatus[invoice.status].toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-text-muted uppercase">INV ID</span>
                <span className="text-sm font-mono text-white bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                  {invoice.id.toString().slice(-6)}
                </span>
              </div>
            </div>

            <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-12 relative">
              
              {/* Overlay for Live Payment Status Timeline */}
              <AnimatePresence>
                {status !== "idle" && status !== "error" && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-40 bg-slate-bg/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="w-full max-w-sm space-y-8">
                      {status !== "success" ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="animate-spin text-stellar-blue mb-4" size={40} />
                          <h3 className="text-xl font-bold text-white">Executing Settle Logic</h3>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <CheckCircle2 className="text-success mb-4 animate-bounce" size={48} />
                          <h3 className="text-xl font-bold text-white">Payment Confirmed</h3>
                          <p className="text-xs text-text-secondary mt-1">Transaction recorded on-chain</p>
                        </div>
                      )}

                      {/* Transaction Flow Milestones */}
                      <div className="space-y-4 text-left text-sm font-light">
                        <div className="flex items-center justify-between">
                          <span className={internalStep >= 1 ? "text-white font-bold" : "text-text-muted"}>1. Build Transaction</span>
                          {internalStep > 1 ? <CheckCircle2 size={16} className="text-success" /> : <Clock size={16} className="text-text-muted" />}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={internalStep >= 2 ? "text-white font-bold" : "text-text-muted"}>2. Awaiting Wallet Sign</span>
                          {internalStep > 2 ? <CheckCircle2 size={16} className="text-success" /> : <Clock size={16} className="text-text-muted" />}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={internalStep >= 3 ? "text-white font-bold" : "text-text-muted"}>3. Submit XDR to Stellar</span>
                          {internalStep > 3 ? <CheckCircle2 size={16} className="text-success" /> : <Clock size={16} className="text-text-muted" />}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={internalStep >= 4 ? "text-white font-bold" : "text-text-muted"}>4. Ledger Confirmation</span>
                          {internalStep >= 4 ? <CheckCircle2 size={16} className="text-success animate-pulse" /> : <Clock size={16} className="text-text-muted" />}
                        </div>
                      </div>

                      {/* Transaction hash display */}
                      {txHash && (
                        <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono">
                          <span className="truncate w-44">{txHash}</span>
                          <a href={getTransactionUrl(txHash)} target="_blank" rel="noreferrer" className="text-stellar-blue flex items-center hover:underline">
                            Explorer
                            <ExternalLink size={12} className="ml-1" />
                          </a>
                        </div>
                      )}

                      {status === "success" && (
                        <Button variant="secondary" size="md" className="w-full mt-4" onClick={() => window.location.reload()}>
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
                  <p className="text-text-muted text-[10px] uppercase tracking-widest font-bold">Total Amount Due</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-5xl font-black text-white">{amountXLM}</span>
                    <span className="text-2xl text-stellar-blue font-bold">XLM</span>
                  </div>
                </div>

                <div className="space-y-6 text-xs sm:text-sm">
                  {invoice.description && (
                    <div className="pb-4 border-b border-white/5">
                      <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1 font-semibold">Description</p>
                      <p className="text-white font-medium text-base">{invoice.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-white/5">
                    <div className="bg-surface/30 p-4 rounded-xl border border-white/5">
                      <p className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-semibold">From Issuer</p>
                      <a href={getAccountUrl(invoice.creator)} target="_blank" rel="noreferrer" className="flex items-center text-stellar-blue hover:text-white transition-colors font-mono text-xs truncate">
                        {invoice.creator.slice(0, 8)}...{invoice.creator.slice(-6)}
                        <ExternalLink size={12} className="ml-1.5" />
                      </a>
                    </div>

                    <div className="bg-surface/30 p-4 rounded-xl border border-white/5">
                      <p className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-semibold">To Client</p>
                      <p className="text-white font-bold truncate">{invoice.clientName || "Unknown Client"}</p>
                      <a href={getAccountUrl(invoice.recipient)} target="_blank" rel="noreferrer" className="flex items-center text-stellar-blue hover:text-white transition-colors font-mono text-[10px] truncate mt-1">
                        {invoice.recipient.slice(0, 8)}...{invoice.recipient.slice(-6)}
                        <ExternalLink size={10} className="ml-1" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pb-4 border-b border-white/5">
                    <div>
                      <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1 font-semibold">Due Date</p>
                      <div className="flex items-center text-white font-medium">
                        <Calendar size={14} className="mr-1.5 text-stellar-blue" />
                        {invoice.dueDate ? new Date(Number(invoice.dueDate)).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1 font-semibold">Stellar Memo</p>
                      <p className="text-white font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-md inline-block">{invoice.memo || "None"}</p>
                    </div>
                  </div>

                  {invoice.notes && (
                    <div>
                      <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1 font-semibold">Notes</p>
                      <p className="text-text-secondary italic">&quot;{invoice.notes}&quot;</p>
                    </div>
                  )}

                  {invoice.txHash && (
                    <div className="bg-surface/50 rounded-xl p-4 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-text-muted uppercase tracking-wider text-[10px] font-semibold mb-1">Transaction Link</p>
                        <p className="font-mono text-text-secondary truncate w-32 sm:w-60">{invoice.txHash}</p>
                      </div>
                      <a href={getTransactionUrl(invoice.txHash)} target="_blank" rel="noreferrer">
                        <Button variant="secondary" size="sm">
                          View
                          <ExternalLink size={12} className="ml-1" />
                        </Button>
                      </a>
                    </div>
                  )}

                </div>
              </div>

              {/* Right Column: QR Code & Wallet Actions */}
              <div className="w-full lg:w-72 flex flex-col items-center justify-start space-y-6 lg:border-l border-white/5 lg:pl-8 pt-8 lg:pt-0 border-t lg:border-t-0">
                {!isPaid && !isCancelled ? (
                  <>
                    <div className="text-center w-full">
                      <h3 className="text-base font-bold text-white mb-1">SEP-0007 QR Settle</h3>
                      <p className="text-xs text-text-muted">Scan with dynamic Stellar wallets like LOBSTR or Vibrant.</p>
                    </div>

                    <div className="bg-white p-3 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300">
                      <QRCodeSVG value={paymentUri} size={180} level="H" />
                    </div>

                    <div className="w-full flex items-center gap-3">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-[10px] text-text-muted font-bold tracking-widest">OR</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="w-full space-y-3">
                      <Button
                        size="md"
                        onClick={handlePay}
                        disabled={status === "loading" || status === "pending"}
                        className="w-full font-bold shadow-[var(--shadow-premium-button)] text-sm"
                      >
                        {status === "loading" ? <Loader2 className="animate-spin" size={16} /> :
                         status === "pending" ? <span>Sign Wallet payload...</span> :
                         <>
                           <Wallet size={16} className="mr-1.5" />
                           <span>{address ? "Pay with Freighter" : "Connect Wallet"}</span>
                         </>}
                      </Button>

                      {address && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center text-xs text-text-muted font-mono">
                          Connected: {address.slice(0, 5)}...{address.slice(-4)}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4 py-16 text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border shadow-lg ${
                      isPaid 
                        ? 'bg-success/20 border-success/30 text-success' 
                        : 'bg-danger/20 border-danger/30 text-danger'
                    }`}>
                      {isPaid ? <CheckCircle2 size={36} className="animate-bounce" /> : <AlertCircle size={36} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{isPaid ? 'Settle complete' : 'Request Cancelled'}</h4>
                      <p className="text-xs text-text-secondary mt-1">{isPaid ? 'Thank you for your business.' : 'This invoice is no longer valid.'}</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </Card>
        </motion.div>
      </motion.div>

    </div>
  );
}
