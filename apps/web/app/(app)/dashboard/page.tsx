"use client";

import Link from "next/link";
import { useWallet } from "../../../hooks/useWallet";
import { useDashboard } from "../../../hooks/useDashboard";
import { InvoiceStatus } from "@repo/sdk";
import { ArrowUpRight, Clock, CheckCircle2, XCircle, PlusCircle, FileText, Wallet, Activity } from "lucide-react";
import RevenueChart from "../../../components/RevenueChart";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

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
    hidden: { opacity: 0, y: 20 },
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
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-text-secondary mt-1">Here's what's happening with your invoices today.</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/invoices/create">
            <Button size="md">
              <PlusCircle size={18} />
              <span className="hidden sm:inline">Create Invoice</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Revenue Card */}
        <Card variant="glass" padding="md" className="hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-secondary">Total Revenue</p>
            <div className="bg-success/10 p-2 rounded-xl text-success">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{metrics.totalRevenue.toFixed(2)} <span className="text-base text-text-muted font-medium">XLM</span></h3>
          </div>
        </Card>

        {/* Total Invoices */}
        <Card variant="glass" padding="md" className="hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-secondary">Total Invoices</p>
            <div className="bg-stellar-blue/10 p-2 rounded-xl text-stellar-blue">
              <FileText size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{metrics.totalInvoices}</h3>
          </div>
        </Card>

        {/* Paid Card */}
        <Card variant="glass" padding="md" className="hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-secondary">Paid</p>
            <div className="bg-success/10 p-2 rounded-xl text-success">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{metrics.paidCount}</h3>
          </div>
        </Card>

        {/* Pending Card */}
        <Card variant="glass" padding="md" className="hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-secondary">Pending</p>
            <div className="bg-warning/10 p-2 rounded-xl text-warning">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{metrics.pendingCount}</h3>
          </div>
        </Card>

        {/* Cancelled Card */}
        <Card variant="glass" padding="md" className="hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-secondary">Cancelled</p>
            <div className="bg-danger/10 p-2 rounded-xl text-danger">
              <XCircle size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{metrics.cancelledCount}</h3>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Revenue Chart */}
          <Card variant="glass" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center">
                <div className="bg-stellar-blue/10 p-2 rounded-xl mr-3 text-stellar-blue">
                  <Activity size={18} />
                </div>
                Revenue Trend <span className="text-sm text-text-muted font-normal ml-2">(Last 7 Days)</span>
              </h2>
            </div>
            <RevenueChart invoices={invoices} />
          </Card>

          <Card variant="glass" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Recent Activity</h2>
              <Link href="/invoices">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            {invoices.length === 0 ? (
              <div className="text-center py-12 text-text-muted border border-dashed border-white/10 rounded-2xl bg-white/5">
                No invoices found. Create your first invoice!
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id.toString()} className="py-4 flex justify-between items-center hover:bg-white/5 -mx-4 px-4 rounded-xl transition-colors">
                    <div>
                      <p className="font-semibold text-white">{invoice.memo || "No description"}</p>
                      <p className="text-sm text-text-secondary font-mono mt-1">To: {invoice.recipient.slice(0,6)}...{invoice.recipient.slice(-4)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{(Number(invoice.amount) / 10000000).toFixed(2)} XLM</p>
                      <div className="mt-2">
                        {invoice.status === InvoiceStatus.Paid && <Badge variant="success">Paid</Badge>}
                        {invoice.status === InvoiceStatus.Pending && <Badge variant="warning">Pending</Badge>}
                        {invoice.status === InvoiceStatus.Cancelled && <Badge variant="danger">Cancelled</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Wallet Summary */}
          <Card variant="highlight" padding="lg">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center">
              <Wallet className="mr-2 text-stellar-blue" size={20} />
              Wallet Summary
            </h2>
            <div className="bg-surface/50 rounded-xl p-4 border border-white/5">
              <p className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">Connected Address</p>
              <p className="font-mono text-sm text-emerald break-all">{address || "Not connected"}</p>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card variant="glass" padding="lg">
            <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/invoices/create" className="block w-full">
                <Button variant="secondary" className="w-full justify-start">
                  <PlusCircle size={18} />
                  New Invoice
                </Button>
              </Link>
              <Link href="/invoices" className="block w-full">
                <Button variant="ghost" className="w-full justify-start bg-white/5">
                  <FileText size={18} />
                  View All Invoices
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
