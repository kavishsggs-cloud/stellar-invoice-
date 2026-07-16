"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, PlusCircle, Settings, Menu, X, LogOut, Hexagon } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { address, disconnect } = useWallet();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Create Invoice", href: "/invoices/create", icon: PlusCircle },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const sidebarContent = (
    <>
      <div className="p-6 flex items-center space-x-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary-cta shadow-[var(--shadow-premium-button)]">
          <Hexagon className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-text-primary">Stellar Invoice</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
                <span className={isActive ? "font-semibold" : "font-medium"}>{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="glass-panel rounded-2xl p-4 flex flex-col space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-glass-glow rounded-full blur-2xl opacity-50 -mr-10 -mt-10" />
          
          <div className="relative z-10">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Connected Wallet</p>
            <p className="text-sm font-mono text-text-primary">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={disconnect}
            className="w-full justify-start px-0 text-danger hover:text-danger hover:bg-danger/10 mt-2 z-10"
          >
            <LogOut size={16} />
            <span>Disconnect</span>
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-midnight-navy text-text-primary selection:bg-stellar-blue selection:text-white">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex w-72 flex-col glass-panel border-y-0 border-l-0 rounded-none z-10">
        {sidebarContent}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-stellar-blue/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-premium/10 blur-[120px] pointer-events-none" />

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 glass-panel border-x-0 border-t-0 rounded-none z-30">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-cta">
              <Hexagon className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Stellar Invoice</span>
          </div>
          <button
            className="text-text-secondary hover:text-white focus:outline-none transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute inset-0 z-20 glass-panel backdrop-blur-2xl pt-20 flex flex-col"
            >
              {sidebarContent}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

