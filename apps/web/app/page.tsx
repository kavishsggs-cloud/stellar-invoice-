"use client";

import React from "react";
import { motion } from "framer-motion";
import { useStellar } from "../providers/StellarProvider";
import { Wallet, ArrowRight, Zap, Globe, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const { address, connect, disconnect } = useStellar();

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 flex justify-center items-center pointer-events-none">
        <div className="absolute top-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-xl font-bold tracking-tight"
        >
          <Zap className="text-blue-500 w-6 h-6" />
          <span>Stellar<span className="text-blue-500">Invoice</span></span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {address ? (
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 text-sm font-medium border border-white/10 rounded-full bg-white/5 backdrop-blur-md">
                {formatAddress(address)}
              </span>
              <Link href="/dashboard" className="px-5 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-neutral-200 transition-colors">
                Dashboard
              </Link>
              <button onClick={disconnect} className="text-sm text-neutral-400 hover:text-white transition-colors">
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={connect}
              className="group relative flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-blue-600 rounded-full hover:bg-blue-500 transition-all active:scale-95"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
              <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center sm:pt-40 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-sm border rounded-full border-blue-500/30 bg-blue-500/10 text-blue-300"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Powered by Soroban Smart Contracts
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-br from-white via-neutral-200 to-neutral-500 pb-2"
        >
          Create. Share. <br/> Get Paid.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mt-8 text-lg sm:text-xl text-neutral-400 leading-relaxed"
        >
          Borderless invoicing powered by the Stellar network. Send professional invoices and receive fast, low-fee payments in XLM or USDC instantly.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-12"
        >
          {address ? (
            <Link 
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-black bg-white rounded-full hover:bg-neutral-200 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button 
              onClick={connect}
              className="flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-colors shadow-[0_0_30px_rgba(37,99,235,0.3)]"
            >
              Start Invoicing
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid w-full grid-cols-1 gap-6 mt-32 sm:grid-cols-3 text-left"
        >
          {[
            { icon: Globe, title: "Borderless Payments", desc: "Settle invoices instantly across the globe with virtually zero fees on Stellar." },
            { icon: ShieldCheck, title: "On-Chain Verification", desc: "Every invoice and payment is immutably recorded via Soroban smart contracts." },
            { icon: Zap, title: "USDC & XLM Ready", desc: "Get paid in stablecoins or native XLM, giving you flexibility and stability." }
          ].map((feature, i) => (
            <div key={i} className="p-6 border border-neutral-800 rounded-2xl bg-neutral-900/50 backdrop-blur-sm hover:bg-neutral-800/50 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-blue-500/10 text-blue-500">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
