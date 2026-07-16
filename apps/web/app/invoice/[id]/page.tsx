"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { InvoiceStatus } from "@repo/sdk";
import { useWallet } from "../../../hooks/useWallet";
import { usePayment } from "../../../hooks/usePayment";
import { useExplorer } from "../../../hooks/useExplorer";
import { useInvoice } from "../../../hooks/useInvoice";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, Loader2, Wallet, ExternalLink, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

export default function InvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const { address, connect } = useWallet();
  const { status, error, payInvoice } = usePayment();
  const { getTransactionUrl, getAccountUrl } = useExplorer();

  const { data: invoice, isLoading, error: fetchError } = useInvoice(id);

  // Handle errors from usePayment or fetch
  useEffect(() => {
    if (error) toast.error(error);
    if (fetchError) toast.error(fetchError);
  }, [error, fetchError]);

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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-stellar-blue" size={40} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
          <div className="w-20 h-20 bg-danger/20 rounded-full flex items-center justify-center mb-6">
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
  
  // Payment URI (SEP-0007 could be used here)
  const paymentUri = `web+stellar:pay?destination=${invoice.creator}&amount=${amountXLM}&asset_code=XLM&memo=${encodeURIComponent(invoice.memo || `INV-${invoice.id}`)}`;

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-stellar-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stellar-blue/10 mb-6 shadow-[0_0_30px_rgba(8,181,229,0.2)]">
            <Wallet className="text-stellar-blue" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Payment Request</h1>
          <p className="text-text-secondary mt-3 font-light text-lg">Powered by Stellar Network</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card variant="glass" padding="none" className="overflow-hidden">
            {/* Header Status Bar */}
            <div className={`px-8 py-5 flex items-center justify-between border-b border-white/5 ${
              isPaid ? 'bg-success/10' : 
              isCancelled ? 'bg-danger/10' : 
              'bg-surface/50'
            }`}>
              <div className="flex items-center space-x-3">
                {isPaid ? <CheckCircle2 className="text-success" size={24} /> :
                 isCancelled ? <AlertCircle className="text-danger" size={24} /> :
                 <ClockIcon />}
                <span className={`text-lg font-bold ${
                  isPaid ? 'text-success' : 
                  isCancelled ? 'text-danger' : 
                  'text-white'
                }`}>
                  {InvoiceStatus[invoice.status].toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-muted">INVOICE NO.</span>
                <span className="text-sm font-mono text-white bg-white/5 px-2 py-1 rounded-md">INV-{invoice.id.toString().slice(-6)}</span>
              </div>
            </div>

            <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-12">
              {/* Invoice Details */}
              <div className="flex-1 space-y-10">
                <div>
                  <p className="text-text-muted text-xs mb-2 uppercase tracking-widest font-bold">Amount Due</p>
                  <div className="flex items-baseline space-x-3">
                    <span className="text-5xl md:text-6xl font-black text-white">{amountXLM}</span>
                    <span className="text-2xl text-stellar-blue font-semibold">XLM</span>
                  </div>
                </div>

                <div className="space-y-6 text-sm">
                  {invoice.description && (
                    <div className="pb-6 border-b border-white/5">
                      <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-2">Description</p>
                      <p className="text-white font-medium text-lg">{invoice.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-white/5">
                    <div className="bg-surface/30 p-4 rounded-xl border border-white/5">
                      <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">From (Creator)</p>
                      <a href={getAccountUrl(invoice.creator)} target="_blank" rel="noreferrer" className="flex items-center text-stellar-blue hover:text-white transition-colors font-mono truncate">
                        {invoice.creator.slice(0, 8)}...{invoice.creator.slice(-6)}
                        <ExternalLink size={14} className="ml-2" />
                      </a>
                    </div>
                    <div className="bg-surface/30 p-4 rounded-xl border border-white/5">
                      <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">To (Client)</p>
                      <p className="text-white font-bold mb-1 truncate text-base">{invoice.clientName || "Unknown Client"}</p>
                      <a href={getAccountUrl(invoice.recipient)} target="_blank" rel="noreferrer" className="flex items-center text-stellar-blue hover:text-white transition-colors font-mono text-xs truncate">
                        {invoice.recipient.slice(0, 8)}...{invoice.recipient.slice(-6)}
                        <ExternalLink size={12} className="ml-2" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-white/5">
                    <div>
                      <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-2">Due Date</p>
                      <div className="flex items-center text-white font-medium">
                        <Calendar size={16} className="mr-2 text-stellar-blue" />
                        {invoice.dueDate ? new Date(Number(invoice.dueDate)).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-2">Stellar Memo</p>
                      <p className="text-white font-mono bg-white/5 inline-block px-3 py-1.5 rounded-lg border border-white/5">{invoice.memo || "None"}</p>
                    </div>
                  </div>

                  {invoice.notes && (
                    <div>
                      <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-2">Notes</p>
                      <p className="text-text-secondary italic text-base leading-relaxed">&quot;{invoice.notes}&quot;</p>
                    </div>
                  )}
                </div>

                {/* Transaction Hash */}
                {invoice.txHash && (
                  <div className="bg-surface/50 rounded-xl p-5 border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Transaction</p>
                      <p className="text-sm font-mono text-text-secondary truncate w-48 md:w-64">{invoice.txHash}</p>
                    </div>
                    <a href={getTransactionUrl(invoice.txHash)} target="_blank" rel="noreferrer">
                      <Button variant="secondary" size="sm">
                        <span>View</span>
                        <ExternalLink size={14} className="ml-2" />
                      </Button>
                    </a>
                  </div>
                )}
              </div>

              {/* Payment Section / QR Code */}
              <div className="w-full lg:w-80 flex flex-col items-center justify-start space-y-8 lg:border-l border-white/5 lg:pl-10 pt-10 lg:pt-0 border-t lg:border-t-0">
                {!isPaid && !isCancelled ? (
                  <>
                    <div className="w-full text-center mb-2">
                      <h3 className="text-lg font-bold text-white mb-2">Pay via QR Code</h3>
                      <p className="text-sm text-text-muted">Scan with a supported Stellar wallet (like LOBSTR or Vibrant).</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-transform hover:scale-105 duration-300">
                      <QRCodeSVG value={paymentUri} size={220} level="H" />
                    </div>
                    
                    <div className="w-full flex items-center gap-4 my-2">
                      <div className="h-px flex-1 bg-white/10"></div>
                      <span className="text-xs text-text-muted uppercase font-bold tracking-widest">OR</span>
                      <div className="h-px flex-1 bg-white/10"></div>
                    </div>
                    
                    <div className="w-full space-y-4">
                      <Button
                        size="lg"
                        onClick={handlePay}
                        disabled={status === "loading" || status === "pending"}
                        className="w-full text-base font-bold shadow-[0_0_20px_rgba(8,181,229,0.3)] hover:shadow-[0_0_30px_rgba(8,181,229,0.5)]"
                      >
                        {status === "loading" ? <Loader2 className="animate-spin" size={20} /> :
                         status === "pending" ? <span>Sign in Wallet...</span> :
                         <>
                           <Wallet size={20} className="mr-2" />
                           <span>{address ? 'Pay with Freighter' : 'Connect to Pay'}</span>
                         </>}
                      </Button>
                      
                      {address && (
                        <div className="bg-surface/50 rounded-xl border border-white/5 p-3 flex items-center justify-between">
                          <span className="text-xs text-text-muted">Connected Wallet</span>
                          <span className="text-xs text-white font-mono font-medium">
                            {address.slice(0,4)}...{address.slice(-4)}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-6 py-16">
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className={`w-28 h-28 rounded-full flex items-center justify-center ${isPaid ? 'bg-success/20 shadow-[0_0_40px_rgba(34,197,94,0.3)]' : 'bg-danger/20 shadow-[0_0_40px_rgba(239,68,68,0.3)]'}`}
                    >
                      {isPaid ? <CheckCircle2 className="text-success" size={56} /> : <AlertCircle className="text-danger" size={56} />}
                    </motion.div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {isPaid ? 'Payment Complete' : 'Invoice Cancelled'}
                      </h3>
                      {isPaid && (
                        <p className="text-text-secondary text-base">
                          Thank you for your business.
                        </p>
                      )}
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

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
