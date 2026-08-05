"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useWallet } from "../../../hooks/useWallet";
import { useInvoices } from "../../../hooks/useInvoices";
import { InvoiceStatus } from "@repo/sdk";
import { PlusCircle, Search, FileText, ChevronLeft, ChevronRight, SlidersHorizontal, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/Skeleton";

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

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(inv => 
        (inv.description || inv.memo || "").toLowerCase().includes(lower) ||
        inv.clientName?.toLowerCase().includes(lower) ||
        inv.recipient.toLowerCase().includes(lower)
      );
    }

    if (statusFilter !== "all") {
      const statusNum = parseInt(statusFilter);
      result = result.filter(inv => inv.status === statusNum);
    }

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
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-[#003734]" />
        <Skeleton className="h-16 w-full rounded-[16px] bg-[#003734]" />
        <Skeleton className="h-80 w-full rounded-[16px] bg-[#003734]" />
      </div>
    );
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Paid: 
        return <span className="text-[10px] font-medium uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-[4px] border bg-[#012624] text-[#cbfffc] border-[#cbfffc]/30">Paid</span>;
      case InvoiceStatus.Pending: 
        return <span className="text-[10px] font-medium uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-[4px] border bg-[#003734] text-[#edfffe] border-[#edfffe]/30">Pending</span>;
      case InvoiceStatus.Cancelled: 
        return <span className="text-[10px] font-medium uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-[4px] border bg-[#011d1c] text-[#707777] border-[#707777]/30">Cancelled</span>;
      default: 
        return <span className="text-[10px] font-medium uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-[4px] border bg-[#012624] text-[#bbc7c6] border-[#bbc7c6]/30">Unknown</span>;
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-12 text-[#bbc7c6]"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[36px] font-medium tracking-[-0.03em] text-[#ffffff]">Invoices</h1>
          <p className="text-[#bbc7c6] mt-1 font-normal text-base">Manage and track your ledger billing records.</p>
        </div>
        <Link href="/invoices/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] text-[#011d1c] font-medium text-[13px] uppercase tracking-[0.05em] rounded-[6px] px-6 py-2.5 hover:opacity-90 shadow-none border-0 flex items-center justify-center">
            <PlusCircle size={18} className="mr-2 inline" />
            <span>Create Invoice</span>
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="bg-[#003734] rounded-[16px] border border-[#cbfffc]/10 shadow-none flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-[#cbfffc]/10 bg-[#012624] flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbc7c6]" size={16} />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="flex h-10 w-full rounded-[6px] border border-[#cbfffc]/15 bg-[#003734] pl-10 pr-4 py-2 text-sm text-[#ffffff] placeholder:text-[#707777] focus:outline-none focus:border-[#cbfffc] transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center space-x-2 bg-[#003734] border border-[#cbfffc]/15 rounded-[6px] px-3 py-2 text-xs flex-1 sm:flex-none h-10">
                <SlidersHorizontal size={14} className="text-[#cbfffc]" />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent border-none text-[#ffffff] outline-none w-full appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-[#003734]">All Statuses</option>
                  <option value={InvoiceStatus.Pending.toString()} className="bg-[#003734]">Pending</option>
                  <option value={InvoiceStatus.Paid.toString()} className="bg-[#003734]">Paid</option>
                  <option value={InvoiceStatus.Cancelled.toString()} className="bg-[#003734]">Cancelled</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date_desc" | "date_asc" | "amount_desc" | "amount_asc")}
                className="bg-[#003734] border border-[#cbfffc]/15 rounded-[6px] px-3 py-2 text-xs text-[#ffffff] outline-none focus:border-[#cbfffc] transition-all flex-1 sm:flex-none h-10 cursor-pointer"
              >
                <option value="date_desc" className="bg-[#003734]">Newest First</option>
                <option value="date_asc" className="bg-[#003734]">Oldest First</option>
                <option value="amount_desc" className="bg-[#003734]">Highest Amount</option>
                <option value="amount_asc" className="bg-[#003734]">Lowest Amount</option>
              </select>
            </div>
          </div>

          {invoices.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-20 h-20 bg-[#012624] rounded-[16px] flex items-center justify-center mx-auto mb-6 border border-[#cbfffc]/20">
                <FileText className="text-[#cbfffc]" size={32} />
              </div>
              <h3 className="text-2xl font-medium text-[#ffffff] mb-2">No invoices yet</h3>
              <p className="text-[#bbc7c6] max-w-md mx-auto mb-8 font-normal text-sm">
                You haven&apos;t created any invoices. Get started by creating your first invoice and sharing the payment link.
              </p>
              <Link href="/invoices/create">
                <Button className="bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] text-[#011d1c] font-medium text-[14px] uppercase tracking-[0.05em] rounded-[6px] px-8 py-3.5 hover:opacity-90 shadow-none border-0">
                  <PlusCircle size={18} className="mr-2 inline" />
                  <span>Create your first invoice</span>
                </Button>
              </Link>
            </div>
          ) : filteredAndSortedInvoices.length === 0 ? (
            <div className="text-center py-16 px-4 text-[#bbc7c6] text-sm font-normal">
              No invoices match your search or filter criteria.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="text-[#edfffe] text-xs uppercase tracking-[0.1em] border-b border-[#cbfffc]/10 bg-[#012624]">
                    <tr>
                      <th className="px-6 py-4 font-medium">Description</th>
                      <th className="px-6 py-4 font-medium">Client</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cbfffc]/10">
                    {currentInvoices.map((invoice) => (
                      <tr key={invoice.id.toString()} className="hover:bg-[#012624]/60 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="font-medium text-[#ffffff] text-sm">{invoice.description || invoice.memo || "No description"}</p>
                          <p className="text-[10px] text-[#bbc7c6]/70 font-mono mt-0.5">ID: {invoice.id.toString()}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-[#ffffff] font-medium text-sm">{invoice.clientName || "Unknown"}</p>
                          <p className="text-[10px] text-[#bbc7c6]/70 font-mono mt-0.5">{invoice.recipient.slice(0, 6)}...{invoice.recipient.slice(-4)}</p>
                        </td>
                        <td className="px-6 py-5 font-medium text-[#fde9ff] text-base font-['Matter',sans-serif]">
                          {(Number(invoice.amount) / 10000000).toFixed(2)} <span className="text-xs text-[#bbc7c6] font-normal">XLM</span>
                        </td>
                        <td className="px-6 py-5">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="px-6 py-5 text-[#bbc7c6] text-xs">
                          {new Date(Number(invoice.createdAt)).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Link href={`/invoice/${invoice.id.toString()}`}>
                            <Button className="bg-[#012624] text-[#edfffe] font-medium text-[12px] uppercase tracking-[0.05em] rounded-[6px] px-3.5 py-1.5 hover:bg-[#012624]/80 border border-[#cbfffc]/15 shadow-none">
                              View Link
                              <ExternalLink size={12} className="ml-1 inline" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-[#cbfffc]/10">
                {currentInvoices.map((invoice) => (
                  <div key={invoice.id.toString()} className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-[#ffffff] text-base">{invoice.description || invoice.memo || "No description"}</p>
                        <p className="text-xs text-[#bbc7c6] mt-1">{invoice.clientName || "Unknown Client"}</p>
                      </div>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="flex justify-between items-end pt-2">
                      <div>
                        <p className="text-xs text-[#bbc7c6]/70 mb-2">{new Date(Number(invoice.createdAt)).toLocaleDateString()}</p>
                        <Link href={`/invoice/${invoice.id.toString()}`}>
                          <Button className="bg-[#012624] text-[#edfffe] font-medium text-[12px] uppercase tracking-[0.05em] rounded-[6px] px-3 py-1.5 hover:bg-[#012624]/80 border border-[#cbfffc]/15 shadow-none">
                            View Receipt
                          </Button>
                        </Link>
                      </div>
                      <p className="font-medium text-[#fde9ff] text-lg font-['Matter',sans-serif]">
                        {(Number(invoice.amount) / 10000000).toFixed(2)} <span className="text-xs text-[#bbc7c6]">XLM</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-[#cbfffc]/10 flex items-center justify-between bg-[#012624]">
                  <p className="text-xs text-[#bbc7c6] font-normal">
                    Showing <span className="font-medium text-[#ffffff]">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-[#ffffff]">{Math.min(currentPage * itemsPerPage, filteredAndSortedInvoices.length)}</span> of <span className="font-medium text-[#ffffff]">{filteredAndSortedInvoices.length}</span>
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      className="bg-[#003734] text-[#ffffff] rounded-[6px] p-2 hover:bg-[#003734]/80 border border-[#cbfffc]/15 shadow-none disabled:opacity-30"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <Button
                      className="bg-[#003734] text-[#ffffff] rounded-[6px] p-2 hover:bg-[#003734]/80 border border-[#cbfffc]/15 shadow-none disabled:opacity-30"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

