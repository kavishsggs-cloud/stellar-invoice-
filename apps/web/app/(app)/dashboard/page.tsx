"use client";

import Link from "next/link";
import { useWallet } from "../../../hooks/useWallet";
import { useDashboard } from "../../../hooks/useDashboard";
import { InvoiceStatus } from "@repo/sdk";
import { ArrowUpRight, Clock, CheckCircle2, XCircle, PlusCircle, FileText, Wallet } from "lucide-react";

export default function Dashboard() {
  const { address } = useWallet();
  const { invoices, metrics, isLoading } = useDashboard();

  if (isLoading || !metrics || !invoices) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-zinc-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-zinc-800 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex space-x-3">
          <Link
            href="/invoices/create"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <PlusCircle size={20} />
            <span className="hidden sm:inline">Create Invoice</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Revenue Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">Total Revenue</p>
            <ArrowUpRight className="text-green-500" size={20} />
          </div>
          <div className="mt-2">
            <h3 className="text-3xl font-bold">{metrics.totalRevenue.toFixed(2)} XLM</h3>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">Total Invoices</p>
            <FileText className="text-blue-400" size={20} />
          </div>
          <div className="mt-2">
            <h3 className="text-3xl font-bold">{metrics.totalInvoices}</h3>
          </div>
        </div>

        {/* Paid Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">Paid Invoices</p>
            <CheckCircle2 className="text-green-500" size={20} />
          </div>
          <div className="mt-2">
            <h3 className="text-3xl font-bold">{metrics.paidCount}</h3>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">Pending</p>
            <Clock className="text-orange-500" size={20} />
          </div>
          <div className="mt-2">
            <h3 className="text-3xl font-bold">{metrics.pendingCount}</h3>
          </div>
        </div>

        {/* Cancelled Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">Cancelled</p>
            <XCircle className="text-red-500" size={20} />
          </div>
          <div className="mt-2">
            <h3 className="text-3xl font-bold">{metrics.cancelledCount}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Link href="/invoices" className="text-sm text-blue-500 hover:underline">View All</Link>
          </div>
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              No invoices found. Create your first invoice!
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id.toString()} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-white">{invoice.memo || "No description"}</p>
                    <p className="text-sm text-zinc-400 font-mono mt-1">To: {invoice.recipient.slice(0,6)}...{invoice.recipient.slice(-4)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{(Number(invoice.amount) / 10000000).toFixed(2)} XLM</p>
                    <div className="mt-1">
                      <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                        invoice.status === InvoiceStatus.Paid ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        invoice.status === InvoiceStatus.Pending ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                        'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {InvoiceStatus[invoice.status]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Wallet Summary */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Wallet className="mr-2 text-zinc-400" size={20} />
              Wallet Summary
            </h2>
            <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Connected Address</p>
              <p className="font-mono text-sm text-green-400 break-all">{address || "Not connected"}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/invoices/create" className="block w-full bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors">
                New Invoice
              </Link>
              <Link href="/invoices" className="block w-full bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors">
                View All Invoices
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
