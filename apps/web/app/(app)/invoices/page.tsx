"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useWallet } from "../../../hooks/useWallet";
import { useInvoices } from "../../../hooks/useInvoices";
import { InvoiceStatus } from "@repo/sdk";
import { PlusCircle, Search, FileText, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

export default function InvoicesList() {
  const { address } = useWallet();
  const { data: invoices, isLoading } = useInvoices(address);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredAndSortedInvoices = useMemo(() => {
    let result = [...invoices];

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(inv => 
        (inv.description || inv.memo || "").toLowerCase().includes(lower) ||
        inv.clientName?.toLowerCase().includes(lower) ||
        inv.recipient.toLowerCase().includes(lower)
      );
    }

    // Filter
    if (statusFilter !== "all") {
      const statusNum = parseInt(statusFilter);
      result = result.filter(inv => inv.status === statusNum);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return Number(b.createdAt) - Number(a.createdAt);
        case "date_asc":
          return Number(a.createdAt) - Number(b.createdAt);
        case "amount_desc":
          return Number(b.amount) - Number(a.amount);
        case "amount_asc":
          return Number(a.amount) - Number(b.amount);
        default:
          return 0;
      }
    });

    return result;
  }, [invoices, searchTerm, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedInvoices.length / itemsPerPage) || 1;
  const currentInvoices = filteredAndSortedInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-zinc-800 rounded"></div>
        <div className="h-16 bg-zinc-800 rounded-xl"></div>
        <div className="h-64 bg-zinc-800 rounded-xl"></div>
      </div>
    );
  }

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Paid: return 'bg-green-500/10 text-green-500 border-green-500/20';
      case InvoiceStatus.Pending: return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case InvoiceStatus.Cancelled: return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <Link
          href="/invoices/create"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center"
        >
          <PlusCircle size={20} />
          <span>Create Invoice</span>
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search by client or description..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white w-full outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-500"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm flex-1 sm:flex-none">
              <SlidersHorizontal size={16} className="text-zinc-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-transparent border-none text-white outline-none w-full appearance-none"
              >
                <option value="all">All Status</option>
                <option value={InvoiceStatus.Pending.toString()}>Pending</option>
                <option value={InvoiceStatus.Paid.toString()}>Paid</option>
                <option value={InvoiceStatus.Cancelled.toString()}>Cancelled</option>
              </select>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all flex-1 sm:flex-none"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-zinc-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No invoices yet</h3>
            <p className="text-zinc-400 max-w-md mx-auto mb-6">
              You haven't created any invoices. Get started by creating your first invoice and sharing the payment link.
            </p>
            <Link
              href="/invoices/create"
              className="inline-flex items-center space-x-2 bg-zinc-100 text-zinc-900 hover:bg-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <PlusCircle size={20} />
              <span>Create your first invoice</span>
            </Link>
          </div>
        ) : filteredAndSortedInvoices.length === 0 ? (
          <div className="text-center py-16 px-4 text-zinc-400">
            No invoices match your search or filter criteria.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/80 text-zinc-400 text-sm border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Description</th>
                    <th className="px-6 py-4 font-medium">Client</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {currentInvoices.map((invoice) => (
                    <tr key={invoice.id.toString()} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{invoice.description || invoice.memo || "No description"}</p>
                        <p className="text-xs text-zinc-500 font-mono">ID: {invoice.id.toString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-zinc-300 font-medium">{invoice.clientName || "Unknown"}</p>
                        <p className="text-xs text-zinc-500 font-mono">{invoice.recipient.slice(0, 6)}...{invoice.recipient.slice(-4)}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        {(Number(invoice.amount) / 10000000).toFixed(2)} <span className="text-xs text-zinc-500">XLM</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(invoice.status)}`}>
                          {InvoiceStatus[invoice.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">
                        {new Date(Number(invoice.createdAt)).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/invoice/${invoice.id.toString()}`}
                          className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          View Link
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-zinc-800">
              {currentInvoices.map((invoice) => (
                <div key={invoice.id.toString()} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">{invoice.description || invoice.memo || "No description"}</p>
                      <p className="text-sm text-zinc-400">{invoice.clientName || "Unknown Client"}</p>
                    </div>
                    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(invoice.status)}`}>
                      {InvoiceStatus[invoice.status]}
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <div>
                      <p className="text-xs text-zinc-500">{new Date(Number(invoice.createdAt)).toLocaleDateString()}</p>
                      <Link
                        href={`/invoice/${invoice.id.toString()}`}
                        className="text-sm font-medium text-blue-500 hover:text-blue-400 mt-1 inline-block"
                      >
                        View Public Link
                      </Link>
                    </div>
                    <p className="font-bold text-white text-lg">
                      {(Number(invoice.amount) / 10000000).toFixed(2)} XLM
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                <p className="text-sm text-zinc-400">
                  Showing <span className="font-medium text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-white">{Math.min(currentPage * itemsPerPage, filteredAndSortedInvoices.length)}</span> of <span className="font-medium text-white">{filteredAndSortedInvoices.length}</span> results
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
