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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 text-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold text-white mb-2">Invoice Not Found</h1>
        <p className="text-zinc-400">The invoice you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  const isPaid = invoice.status === InvoiceStatus.Paid;
  const isCancelled = invoice.status === InvoiceStatus.Cancelled;
  const amountXLM = (Number(invoice.amount) / 10000000).toFixed(2);
  
  // Payment URI (SEP-0007 could be used here)
  const paymentUri = `web+stellar:pay?destination=${invoice.creator}&amount=${amountXLM}&asset_code=XLM&memo=${encodeURIComponent(invoice.memo || `INV-${invoice.id}`)}`;

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
            <Wallet className="text-blue-500" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Payment Request</h1>
          <p className="text-zinc-400 mt-2">Powered by Stellar Network</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header Status Bar */}
          <div className={`px-6 py-4 flex items-center justify-between border-b ${
            isPaid ? 'bg-green-500/10 border-green-500/20' : 
            isCancelled ? 'bg-red-500/10 border-red-500/20' : 
            'bg-zinc-800/50 border-zinc-800'
          }`}>
            <div className="flex items-center space-x-2">
              {isPaid ? <CheckCircle2 className="text-green-500" size={20} /> :
               isCancelled ? <AlertCircle className="text-red-500" size={20} /> :
               <ClockIcon />}
              <span className={`font-semibold ${
                isPaid ? 'text-green-500' : 
                isCancelled ? 'text-red-500' : 
                'text-zinc-300'
              }`}>
                {InvoiceStatus[invoice.status].toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-mono text-zinc-500">INV-{invoice.id.toString().slice(-6)}</span>
          </div>

          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
            {/* Invoice Details */}
            <div className="flex-1 space-y-8">
              <div>
                <p className="text-zinc-500 text-sm mb-1 uppercase tracking-wider font-semibold">Amount Due</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl md:text-5xl font-bold text-white">{amountXLM}</span>
                  <span className="text-xl text-zinc-400">XLM</span>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                {invoice.description && (
                  <div className="pb-4 border-b border-zinc-800">
                    <p className="text-zinc-500 mb-1">Description</p>
                    <p className="text-white font-medium text-base">{invoice.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-800">
                  <div>
                    <p className="text-zinc-500 mb-1">From (Creator)</p>
                    <a href={getAccountUrl(invoice.creator)} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-mono truncate block">
                      {invoice.creator.slice(0, 6)}...{invoice.creator.slice(-4)}
                    </a>
                  </div>
                  <div>
                    <p className="text-zinc-500 mb-1">To (Client)</p>
                    <p className="text-white font-medium truncate">{invoice.clientName || "Unknown"}</p>
                    <a href={getAccountUrl(invoice.recipient)} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-mono truncate block">
                      {invoice.recipient.slice(0, 6)}...{invoice.recipient.slice(-4)}
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-800">
                  <div>
                    <p className="text-zinc-500 mb-1">Due Date</p>
                    <div className="flex items-center text-white">
                      <Calendar size={14} className="mr-1.5 text-zinc-400" />
                      {invoice.dueDate ? new Date(Number(invoice.dueDate)).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <p className="text-zinc-500 mb-1">Memo</p>
                    <p className="text-white font-mono">{invoice.memo || "None"}</p>
                  </div>
                </div>

                {invoice.notes && (
                  <div>
                    <p className="text-zinc-500 mb-1">Notes</p>
                    <p className="text-zinc-300 italic">&quot;{invoice.notes}&quot;</p>
                  </div>
                )}
              </div>

              {/* Transaction Hash */}
              {invoice.txHash && (
                <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-1">Transaction Hash</p>
                  <a href={getTransactionUrl(invoice.txHash)} target="_blank" rel="noreferrer" className="flex items-center text-blue-400 hover:text-blue-300 text-sm font-mono truncate transition-colors">
                    <span className="truncate">{invoice.txHash}</span>
                    <ExternalLink size={14} className="ml-1.5 flex-shrink-0" />
                  </a>
                </div>
              )}
            </div>

            {/* Payment Section / QR Code */}
            <div className="w-full md:w-64 flex flex-col items-center justify-start space-y-6 md:border-l border-zinc-800 md:pl-8 pt-8 md:pt-0 border-t md:border-t-0">
              {!isPaid && !isCancelled ? (
                <>
                  <div className="bg-white p-3 rounded-xl shadow-lg">
                    <QRCodeSVG value={paymentUri} size={200} level="H" />
                  </div>
                  <p className="text-xs text-zinc-500 text-center px-4">
                    Scan with a supported Stellar wallet (like LOBSTR or Vibrant) to pay from mobile.
                  </p>
                  
                  <div className="w-full h-px bg-zinc-800 my-2"></div>
                  
                  <div className="w-full space-y-3">
                    <button
                      onClick={handlePay}
                      disabled={status === "loading" || status === "pending"}
                      className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-zinc-200 text-black px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                      {status === "loading" ? <Loader2 className="animate-spin text-black" size={20} /> :
                       status === "pending" ? <span>Sign in Wallet...</span> :
                       <>
                         <Wallet size={18} />
                         <span>{address ? 'Pay with Freighter' : 'Connect to Pay'}</span>
                       </>}
                    </button>
                    {address && (
                      <p className="text-xs text-center text-zinc-500 font-mono">
                        Connected: {address.slice(0,4)}...{address.slice(-4)}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4 py-12">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isPaid ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {isPaid ? <CheckCircle2 className="text-green-500" size={48} /> : <AlertCircle className="text-red-500" size={48} />}
                  </div>
                  <h3 className="text-xl font-bold text-white text-center">
                    {isPaid ? 'Payment Complete' : 'Invoice Cancelled'}
                  </h3>
                  {isPaid && (
                    <p className="text-zinc-400 text-sm text-center">
                      Thank you for your business.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
