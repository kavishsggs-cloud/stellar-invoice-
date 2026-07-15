import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, PlusCircle, Settings, Menu, X, LogOut } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";

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

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex w-64 flex-col bg-zinc-900 border-r border-zinc-800">
        <div className="p-6 flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">
            S
          </div>
          <span className="text-xl font-bold tracking-tight">StellarInvoice</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-600/10 text-blue-500 font-medium"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <p className="text-xs text-zinc-400 mb-1">Connected Wallet</p>
            <p className="text-sm font-mono truncate text-zinc-300">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
            </p>
            <button
              onClick={disconnect}
              className="mt-3 flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors text-sm"
            >
              <LogOut size={16} />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 z-20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              S
            </div>
            <span className="text-xl font-bold tracking-tight">StellarInvoice</span>
          </div>
          <button
            className="text-zinc-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 z-10 bg-zinc-950 pt-20 px-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-4 rounded-xl transition-all ${
                      isActive
                        ? "bg-blue-600/10 text-blue-500 font-medium"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-lg">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-8 border-t border-zinc-800 pt-4">
              <button
                onClick={() => {
                  disconnect();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-4 text-red-400 w-full"
              >
                <LogOut size={20} />
                <span className="text-lg">Disconnect</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
