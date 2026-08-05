"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "../../../hooks/useWallet";
import { useDashboard } from "../../../hooks/useDashboard";
import { InvoiceStatus } from "@repo/sdk";
import { ArrowUpRight, Clock, CheckCircle2, XCircle, PlusCircle, FileText, Wallet, Activity, Calendar } from "lucide-react";
import RevenueChart from "../../../components/RevenueChart";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/button";

const AnimatedCounter = ({ value, duration = 1.2, decimals = 0 }: { value: number; duration?: number; decimals?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(progress * value);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{count.toFixed(decimals)}</span>;
};

export default function Dashboard() {
  const { address } = useWallet();
  const { invoices, metrics, isLoading } = useDashboard();

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

  if (isLoading || !metrics || !invoices) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[#003734] rounded-[6px]"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-[#003734] rounded-[16px] border border-[#cbfffc]/10"></div>)}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12 text-[#bbc7c6]"
    >
      {/* Header section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[36px] font-medium tracking-[-0.03em] text-[#ffffff]">Dashboard Overview</h1>
          <p className="text-[#bbc7c6] mt-1 font-normal text-base">Real-time Soroban contract balance metrics and billing data.</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <Link href="/invoices/create" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] text-[#011d1c] font-medium text-[13px] uppercase tracking-[0.05em] rounded-[6px] px-6 py-2.5 hover:opacity-90 shadow-none border-0 flex items-center justify-center">
              <PlusCircle size={18} className="mr-2 inline" />
              <span>Create Invoice</span>
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Metrics Row (Auros Surface 2 Cards with #fde9ff counters) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-[#003734] rounded-[16px] p-5 border border-[#cbfffc]/10 shadow-none relative group">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#edfffe]">Total Revenue</p>
            <div className="bg-[#012624] p-2 rounded-[6px] text-[#cbfffc] border border-[#cbfffc]/10">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-medium text-[#fde9ff] font-['Matter',sans-serif]">
              <AnimatedCounter value={metrics.totalRevenue} decimals={2} /> 
              <span className="text-xs text-[#bbc7c6] font-normal ml-1.5 uppercase">XLM</span>
            </div>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-[#003734] rounded-[16px] p-5 border border-[#cbfffc]/10 shadow-none relative group">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#edfffe]">Total Invoices</p>
            <div className="bg-[#012624] p-2 rounded-[6px] text-[#cbfffc] border border-[#cbfffc]/10">
              <FileText size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-medium text-[#fde9ff] font-['Matter',sans-serif]">
              <AnimatedCounter value={metrics.totalInvoices} />
            </div>
          </div>
        </div>

        {/* Paid Invoices */}
        <div className="bg-[#003734] rounded-[16px] p-5 border border-[#cbfffc]/10 shadow-none relative group">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#edfffe]">Paid Receipts</p>
            <div className="bg-[#012624] p-2 rounded-[6px] text-[#cbfffc] border border-[#cbfffc]/10">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-medium text-[#fde9ff] font-['Matter',sans-serif]">
              <AnimatedCounter value={metrics.paidCount} />
            </div>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-[#003734] rounded-[16px] p-5 border border-[#cbfffc]/10 shadow-none relative group">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#edfffe]">Pending Requests</p>
            <div className="bg-[#012624] p-2 rounded-[6px] text-[#cbfffc] border border-[#cbfffc]/10">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-medium text-[#fde9ff] font-['Matter',sans-serif]">
              <AnimatedCounter value={metrics.pendingCount} />
            </div>
          </div>
        </div>

        {/* Cancelled Invoices */}
        <div className="bg-[#003734] rounded-[16px] p-5 border border-[#cbfffc]/10 shadow-none relative group">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#edfffe]">Cancelled Receipts</p>
            <div className="bg-[#012624] p-2 rounded-[6px] text-[#707777] border border-[#cbfffc]/10">
              <XCircle size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-medium text-[#fde9ff] font-['Matter',sans-serif]">
              <AnimatedCounter value={metrics.cancelledCount} />
            </div>
          </div>
        </div>

      </motion.div>

      {/* Main Charts & Timelines Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Chart & Timelines */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Revenue Chart Widget */}
          <div className="bg-[#003734] rounded-[16px] p-8 border border-[#cbfffc]/10 shadow-none">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[24px] font-medium text-[#ffffff] flex items-center tracking-[-0.02em]">
                <div className="bg-[#012624] p-2 rounded-[6px] mr-3 text-[#cbfffc] border border-[#cbfffc]/10">
                  <Activity size={18} />
                </div>
                Revenue Trend <span className="text-xs text-[#bbc7c6] font-normal ml-2 uppercase">(Last 7 Days)</span>
              </h2>
            </div>
            <RevenueChart invoices={invoices} />
          </div>

          {/* Timeline Activity Feed */}
          <div className="bg-[#003734] rounded-[16px] p-8 border border-[#cbfffc]/10 shadow-none">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[24px] font-medium text-[#ffffff] tracking-[-0.02em]">Recent Settle Timeline</h2>
              <Link href="/invoices">
                <Button className="bg-[#012624] text-[#edfffe] font-medium text-[12px] uppercase tracking-[0.05em] rounded-[6px] px-4 py-2 hover:bg-[#012624]/80 border border-[#cbfffc]/15 shadow-none">
                  View All
                </Button>
              </Link>
            </div>
            
            {invoices.length === 0 ? (
              <div className="text-center py-12 text-[#bbc7c6] border border-dashed border-[#cbfffc]/10 rounded-[12px] bg-[#012624] font-normal text-sm">
                No active receipts found. Create your first invoice!
              </div>
            ) : (
              <div className="relative border-l border-[#cbfffc]/10 pl-6 ml-4 space-y-8">
                {invoices.slice(0, 4).map((invoice, index) => {
                  const isPaidStatus = invoice.status === InvoiceStatus.Paid;
                  const isCancelledStatus = invoice.status === InvoiceStatus.Cancelled;
                  return (
                    <motion.div 
                      key={invoice.id.toString()}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {/* Timeline Dot Indicator */}
                      <span className={`absolute top-1 -left-[31px] w-4 h-4 rounded-full border-2 border-[#012624] flex items-center justify-center ${
                        isPaidStatus ? "bg-[#cbfffc]" : isCancelledStatus ? "bg-[#707777]" : "bg-[#00827c]"
                      }`} />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#012624]/50 -mx-4 px-4 py-3 rounded-[8px] transition-colors border border-transparent hover:border-[#cbfffc]/10">
                        <div>
                          <p className="font-medium text-[#ffffff] text-sm">{invoice.description || invoice.memo || "No description"}</p>
                          <div className="flex items-center space-x-2 text-xs text-[#bbc7c6] mt-1 font-mono">
                            <span>To: {invoice.recipient.slice(0, 6)}...{invoice.recipient.slice(-4)}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Calendar size={12} className="mr-1" />
                              {new Date(Number(invoice.createdAt)).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right flex items-center sm:flex-col justify-between sm:justify-center">
                          <p className="font-medium text-[#fde9ff] text-base font-['Matter',sans-serif]">{(Number(invoice.amount) / 10000000).toFixed(2)} XLM</p>
                          <div className="sm:mt-1">
                            <span className={`text-[10px] font-medium uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-[4px] border ${
                              isPaidStatus 
                                ? 'bg-[#012624] text-[#cbfffc] border-[#cbfffc]/30'
                                : isCancelledStatus
                                ? 'bg-[#011d1c] text-[#707777] border-[#707777]/30'
                                : 'bg-[#003734] text-[#edfffe] border-[#edfffe]/30'
                            }`}>
                              {isPaidStatus ? 'PAID' : isCancelledStatus ? 'CANCELLED' : 'PENDING'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Account Widgets */}
        <div className="space-y-6">
          
          {/* Wallet Summary */}
          <div className="bg-[#003734] rounded-[16px] p-8 border border-[#cbfffc]/10 shadow-none relative overflow-hidden">
            <h2 className="text-[24px] font-medium text-[#ffffff] mb-4 flex items-center tracking-[-0.02em]">
              <Wallet className="mr-2.5 text-[#cbfffc]" size={20} />
              Connected Node
            </h2>
            <div className="bg-[#012624] rounded-[12px] p-5 border border-[#cbfffc]/10 space-y-3">
              <div>
                <p className="text-[11px] font-medium text-[#edfffe] uppercase tracking-[0.1em]">Account Coordinates</p>
                <p className="font-mono text-xs text-[#cbfffc] break-all mt-1">{address || "Not connected"}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-[#bbc7c6] pt-3 border-t border-[#cbfffc]/10">
                <span>Stellar Network</span>
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#cbfffc] bg-[#003734] px-2.5 py-0.5 rounded-[4px] border border-[#cbfffc]/20">
                  Testnet
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-[#003734] rounded-[16px] p-8 border border-[#cbfffc]/10 shadow-none">
            <h2 className="text-[24px] font-medium text-[#ffffff] mb-4 tracking-[-0.02em]">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/invoices/create" className="block w-full">
                <Button className="w-full justify-start bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] text-[#011d1c] font-medium text-[13px] uppercase tracking-[0.05em] rounded-[6px] px-6 py-3 hover:opacity-90 shadow-none border-0">
                  <PlusCircle size={16} className="mr-2 inline" />
                  New Invoice Request
                </Button>
              </Link>
              <Link href="/invoices" className="block w-full">
                <Button className="w-full justify-start bg-[#012624] text-[#ffffff] font-medium text-[13px] uppercase tracking-[0.05em] rounded-[6px] px-6 py-3 hover:bg-[#012624]/80 border border-[#cbfffc]/20 shadow-none">
                  <FileText size={16} className="mr-2 inline" />
                  All Invoices History
                </Button>
              </Link>
            </div>
          </div>

        </div>

      </motion.div>
    </motion.div>
  );
}

