"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useWallet } from "../../../hooks/useWallet";
import { useInvoices } from "../../../hooks/useInvoices";
import { InvoiceStatus } from "@repo/sdk";
import { PlusCircle, Search, FileText, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

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
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-white/5 rounded-lg"></div>
        <div className="h-16 bg-white/5 rounded-2xl border border-white/5"></div>
        <div className="h-64 bg-white/5 rounded-2xl border border-white/5"></div>
      </div>
    );
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Paid: return <Badge variant="success">Paid</Badge>;
      case InvoiceStatus.Pending: return <Badge variant="warning">Pending</Badge>;
      case InvoiceStatus.Cancelled: return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="neutral">Unknown</Badge>;
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Invoices</h1>
          <p className="text-text-secondary mt-1">Manage and track your payments.</p>
        </div>
        <Link href="/invoices/create" className="w-full sm:w-auto">
          <Button size="md" className="w-full sm:w-auto">
            <PlusCircle size={20} />
            <span>Create Invoice</span>
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card variant="glass" padding="none" className="flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="flex h-10 w-full rounded-xl border border-white/10 bg-surface/50 pl-10 pr-4 py-2 text-sm text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-stellar-blue/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center space-x-2 bg-surface/50 border border-white/10 rounded-xl px-3 py-2 text-sm flex-1 sm:flex-none h-10">
                <SlidersHorizontal size={16} className="text-text-muted" />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent border-none text-white outline-none w-full appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value={InvoiceStatus.Pending.toString()}>Pending</option>
                  <option value={InvoiceStatus.Paid.toString()}>Paid</option>
                  <option value={InvoiceStatus.Cancelled.toString()}>Cancelled</option>
                </select>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date_desc" | "date_asc" | "amount_desc" | "amount_asc")}
                className="bg-surface/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-stellar-blue/30 transition-all flex-1 sm:flex-none h-10 cursor-pointer"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Highest Amount</option>
                <option value="amount_asc">Lowest Amount</option>
              </select>
            </div>
          </div>

          {invoices.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-20 h-20 bg-stellar-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(8,181,229,0.15)]">
                <FileText className="text-stellar-blue" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No invoices yet</h3>
              <p className="text-text-secondary max-w-md mx-auto mb-8 font-light">
                You haven&apos;t created any invoices. Get started by creating your first invoice and sharing the payment link.
              </p>
              <Link href="/invoices/create">
                <Button size="lg">
                  <PlusCircle size={20} />
                  <span>Create your first invoice</span>
                </Button>
              </Link>
            </div>
          ) : filteredAndSortedInvoices.length === 0 ? (
            <div className="text-center py-16 px-4 text-text-muted">
              No invoices match your search or filter criteria.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-text-muted text-sm border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 font-medium tracking-wide">Description</th>
                      <th className="px-6 py-4 font-medium tracking-wide">Client</th>
                      <th className="px-6 py-4 font-medium tracking-wide">Amount</th>
                      <th className="px-6 py-4 font-medium tracking-wide">Status</th>
                      <th className="px-6 py-4 font-medium tracking-wide">Date</th>
                      <th className="px-6 py-4 font-medium tracking-wide text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {currentInvoices.map((invoice) => (
                      <tr key={invoice.id.toString()} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="font-semibold text-white">{invoice.description || invoice.memo || "No description"}</p>
                          <p className="text-xs text-text-muted font-mono mt-1">ID: {invoice.id.toString()}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-white font-medium">{invoice.clientName || "Unknown"}</p>
                          <p className="text-xs text-text-muted font-mono mt-1">{invoice.recipient.slice(0, 6)}...{invoice.recipient.slice(-4)}</p>
                        </td>
                        <td className="px-6 py-5 font-bold text-white">
                          {(Number(invoice.amount) / 10000000).toFixed(2)} <span className="text-xs text-text-muted font-normal">XLM</span>
                        </td>
                        <td className="px-6 py-5">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="px-6 py-5 text-text-secondary text-sm">
                          {new Date(Number(invoice.createdAt)).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Link href={`/invoice/${invoice.id.toString()}`}>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              View Link
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-white/5">
                {currentInvoices.map((invoice) => (
                  <div key={invoice.id.toString()} className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-white text-lg">{invoice.description || invoice.memo || "No description"}</p>
                        <p className="text-sm text-text-secondary mt-1">{invoice.clientName || "Unknown Client"}</p>
                      </div>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="flex justify-between items-end pt-2">
                      <div>
                        <p className="text-xs text-text-muted mb-2">{new Date(Number(invoice.createdAt)).toLocaleDateString()}</p>
                        <Link href={`/invoice/${invoice.id.toString()}`}>
                          <Button variant="secondary" size="sm">
                            View Link
                          </Button>
                        </Link>
                      </div>
                      <p className="font-bold text-white text-xl">
                        {(Number(invoice.amount) / 10000000).toFixed(2)} <span className="text-sm text-text-muted font-normal">XLM</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-white/5 flex items-center justify-between bg-surface/30">
                  <p className="text-sm text-text-secondary">
                    Showing <span className="font-medium text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-white">{Math.min(currentPage * itemsPerPage, filteredAndSortedInvoices.length)}</span> of <span className="font-medium text-white">{filteredAndSortedInvoices.length}</span>
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2"
                    >
                      <ChevronLeft size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2"
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
