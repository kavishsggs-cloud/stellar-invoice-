"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  Menu,
  X,
  LogOut,
  Hexagon,
  Bell,
  Shield,
} from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const pathname = usePathname();
  const { address, disconnect } = useWallet();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Create Invoice", href: "/invoices/create", icon: PlusCircle },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B1728]/50 backdrop-blur-md">
      {/* Brand logo container */}
      <div className="p-6 flex items-center space-x-3 border-b border-white/5">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary-cta shadow-[var(--shadow-premium-button)]">
          <Hexagon
            className="h-6 w-6 text-white animate-spin-slow"
            strokeWidth={2.5}
          />
        </div>
        <span className="text-xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-text-secondary">
          Stellar Invoice
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 space-y-2 mt-6">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block"
            >
              <motion.div
                whileHover={{ x: 4 }}
                className={`relative flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive
                    ? "bg-white/10 text-stellar-blue shadow-sm"
                    : "text-text-secondary hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-stellar-blue rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={isActive ? "font-semibold" : "font-medium"}>
                  {item.name}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Details */}
      <div className="p-6 border-t border-white/5 bg-white/5">
        <div className="glass-panel rounded-2xl p-4 flex flex-col space-y-3 relative overflow-hidden bg-slate-bg/50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-glass-glow rounded-full blur-2xl opacity-50 -mr-10 -mt-10 pointer-events-none" />

          <div className="relative z-10 space-y-1">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              Active Address
            </p>
            <p className="text-xs font-mono text-emerald truncate">
              {address
                ? `${address.slice(0, 8)}...${address.slice(-6)}`
                : "Not connected"}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={disconnect}
            className="w-full justify-start px-0 text-danger hover:text-danger hover:bg-danger/10 mt-2 z-10 text-xs"
          >
            <LogOut size={14} className="mr-1.5" />
            <span>Disconnect Wallet</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#06121F] text-text-primary selection:bg-stellar-blue selection:text-white relative">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex w-72 flex-col border-r border-white/5 z-20">
        {sidebarContent}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden z-10">
        {/* Universal Topbar */}
        <header className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-white/5 bg-[#0B1728]/30 backdrop-blur-md z-30">
          {/* Mobile hamburger logo */}
          <div className="flex items-center space-x-3 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-cta">
              <Hexagon className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Stellar Invoice
            </span>
          </div>

          {/* Desktop page path display */}
          <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-text-muted">
            <span>workspace</span>
            <span>/</span>
            <span className="text-stellar-blue font-semibold">
              {pathname.split("/").filter(Boolean).join(" / ") || "home"}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Ledger status tag */}
            <div className="hidden sm:flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs text-text-secondary font-mono">
              <Shield size={12} className="text-emerald animate-pulse" />
              <span>Soroban Node: Online</span>
            </div>

            {/* Notification trigger */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all focus:outline-none"
              >
                <Bell
                  size={16}
                  className="text-text-secondary hover:text-white"
                />
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 bg-[#132238] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 space-y-3"
                  >
                    <h4 className="font-bold text-sm text-white">
                      Ledger Notifications
                    </h4>
                    <div className="h-px bg-white/5" />
                    <div className="space-y-2 text-xs text-text-secondary font-light">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                        <p className="font-semibold text-white">
                          Network Check
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Connected to Soroban Testnet network.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu hamburger button */}
            <button
              className="md:hidden text-text-secondary hover:text-white focus:outline-none transition-colors p-2 bg-white/5 border border-white/10 rounded-xl"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute inset-0 z-20 pt-16 flex flex-col bg-[#06121F]/95 backdrop-blur-2xl"
            >
              {sidebarContent}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
