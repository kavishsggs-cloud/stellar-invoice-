"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "../../../hooks/useWallet";
import { useDashboard } from "../../../hooks/useDashboard";
import { InvoiceStatus } from "@repo/sdk";
import { ArrowUpRight, Clock, CheckCircle2, XCircle, PlusCircle, FileText, Wallet, Activity, Calendar } from "lucide-react";
import RevenueChart from "../../../components/RevenueChart";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

// Dynamic Animated Number Counter Component
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
        <div className="h-8 w-48 bg-white/5 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/5"></div>)}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      {/* Header section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-text-secondary mt-1 font-light">Real-time Soroban contract balance metrics and billing data.</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <Link href="/invoices/create" className="w-full sm:w-auto">
            <Button size="md" className="w-full sm:w-auto shadow-[var(--shadow-premium-button)]">
              <PlusCircle size={18} />
              <span>Create Invoice</span>
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Revenue */}
        <Card variant="glass" padding="md" className="hover:-translate-y-1 transition-transform relative group">
          <div className="absolute inset-0 bg-glass-glow rounded-3xl opacity-0 group-hover:opacity-40 transition-opacity" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Revenue</p>
            <div className="bg-success/10 p-2 rounded-xl text-success border border-success/10">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white">
              <AnimatedCounter value={metrics.totalRevenue} decimals={2} /> 
              <span className="text-xs text-stellar-blue font-semibold ml-1.5 uppercase">XLM</span>
            </h3>
          </div>
        </Card>

        {/* Total Invoices */}
        <Card variant="glass" padding="md" className="hover:-translate-y-1 transition-transform relative group">
          <div className="absolute inset-0 bg-glass-glow rounded-3xl opacity-0 group-hover:opacity-40 transition-opacity" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Invoices</p>
            <div className="bg-stellar-blue/10 p-2 rounded-xl text-stellar-blue border border-stellar-blue/10">
              <FileText size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white">
              <AnimatedCounter value={metrics.totalInvoices} />
            </h3>
          </div>
        </Card>

        {/* Paid Invoices */}
        <Card variant="glass" padding="md" className="hover:-translate-y-1 transition-transform relative group">
          <div className="absolute inset-0 bg-glass-glow rounded-3xl opacity-0 group-hover:opacity-40 transition-opacity" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Paid Receipts</p>
            <div className="bg-success/10 p-2 rounded-xl text-success border border-success/10">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white">
              <AnimatedCounter value={metrics.paidCount} />
            </h3>
          </div>
        </Card>

        {/* Pending Invoices */}
        <Card variant="glass" padding="md" className="hover:-translate-y-1 transition-transform relative group">
          <div className="absolute inset-0 bg-glass-glow rounded-3xl opacity-0 group-hover:opacity-40 transition-opacity" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Pending Requests</p>
            <div className="bg-warning/10 p-2 rounded-xl text-warning border border-warning/10">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white">
              <AnimatedCounter value={metrics.pendingCount} />
            </h3>
          </div>
        </Card>

        {/* Cancelled Invoices */}
        <Card variant="glass" padding="md" className="hover:-translate-y-1 transition-transform relative group">
          <div className="absolute inset-0 bg-glass-glow rounded-3xl opacity-0 group-hover:opacity-40 transition-opacity" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Cancelled Receipts</p>
            <div className="bg-danger/10 p-2 rounded-xl text-danger border border-danger/10">
              <XCircle size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-white">
              <AnimatedCounter value={metrics.cancelledCount} />
            </h3>
          </div>
        </Card>

      </motion.div>

      {/* Main Charts & Timelines Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Chart & Timelines */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Revenue Chart Widget */}
          <Card variant="glass" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center">
                <div className="bg-stellar-blue/10 p-2 rounded-xl mr-3 text-stellar-blue border border-stellar-blue/15">
                  <Activity size={18} />
                </div>
                Revenue Trend <span className="text-xs text-text-muted font-light ml-2 uppercase">(Last 7 Days)</span>
              </h2>
            </div>
            <RevenueChart invoices={invoices} />
          </Card>

          {/* Timeline Activity Feed */}
          <Card variant="glass" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Recent Settle Timeline</h2>
              <Link href="/invoices">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            
            {invoices.length === 0 ? (
              <div className="text-center py-12 text-text-muted border border-dashed border-white/10 rounded-2xl bg-white/5 font-light">
                No active receipts found. Create your first invoice!
              </div>
            ) : (
              <div className="relative border-l border-white/5 pl-6 ml-4 space-y-8">
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
                      <span className={`absolute top-1 -left-[31px] w-4 h-4 rounded-full border-2 border-[#06121F] flex items-center justify-center ${
                        isPaidStatus ? "bg-success" : isCancelledStatus ? "bg-danger" : "bg-warning"
                      }`} />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/5 -mx-4 px-4 py-2 rounded-xl transition-colors">
                        <div>
                          <p className="font-semibold text-white text-sm">{invoice.description || invoice.memo || "No description"}</p>
                          <div className="flex items-center space-x-2 text-xs text-text-muted mt-1 font-mono">
                            <span>To: {invoice.recipient.slice(0, 6)}...{invoice.recipient.slice(-4)}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Calendar size={12} className="mr-1" />
                              {new Date(Number(invoice.createdAt)).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right flex items-center sm:flex-col justify-between sm:justify-center">
                          <p className="font-bold text-white text-sm">{(Number(invoice.amount) / 10000000).toFixed(2)} XLM</p>
                          <div className="sm:mt-1">
                            {isPaidStatus && <Badge variant="success">Paid</Badge>}
                            {invoice.status === InvoiceStatus.Pending && <Badge variant="warning">Pending</Badge>}
                            {isCancelledStatus && <Badge variant="danger">Cancelled</Badge>}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>

        </div>

        {/* Right Side: Account Widgets */}
        <div className="space-y-6">
          
          {/* Wallet Summary */}
          <Card variant="highlight" padding="lg" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-stellar-blue/10 blur-2xl rounded-full pointer-events-none" />
            <h2 className="text-lg font-bold text-white mb-4 flex items-center">
              <Wallet className="mr-2 text-stellar-blue animate-pulse" size={20} />
              Connected Node
            </h2>
            <div className="bg-surface/50 rounded-xl p-4 border border-white/5 space-y-3">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Account Coordinates</p>
                <p className="font-mono text-xs text-emerald break-all mt-1">{address || "Not connected"}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-white/5">
                <span>Stellar Ledger</span>
                <Badge variant="premium">Testnet</Badge>
              </div>
            </div>
          </Card>

          {/* Quick Actions Panel */}
          <Card variant="glass" padding="lg">
            <h2 className="text-lg font-bold text-white mb-4">Quick actions</h2>
            <div className="space-y-3">
              <Link href="/invoices/create" className="block w-full">
                <Button variant="primary" className="w-full justify-start text-sm">
                  <PlusCircle size={16} className="mr-2" />
                  New Invoice Request
                </Button>
              </Link>
              <Link href="/invoices" className="block w-full">
                <Button variant="secondary" className="w-full justify-start text-sm">
                  <FileText size={16} className="mr-2" />
                  All Invoices History
                </Button>
              </Link>
            </div>
          </Card>

        </div>

      </motion.div>
    </motion.div>
  );
}
