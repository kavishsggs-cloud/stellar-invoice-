"use client";

import React from "react";
import { motion } from "framer-motion";
import { useStellar } from "../providers/StellarProvider";
import { Wallet, ArrowRight, Zap, Globe, ShieldCheck, Hexagon } from "lucide-react";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function LandingPage() {
  const { address, connect, disconnect } = useStellar();

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-hero-gradient text-text-primary selection:bg-stellar-blue selection:text-white overflow-hidden font-sans relative">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-stellar-blue/15 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-premium/15 blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 text-xl sm:text-2xl font-bold tracking-tight"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-cta shadow-[var(--shadow-premium-button)]">
            <Hexagon className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="hidden min-[380px]:inline">Stellar Invoice</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {address ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <Badge variant="neutral" className="hidden md:inline-flex px-4 py-2 text-sm font-mono backdrop-blur-md">
                {formatAddress(address)}
              </Badge>
              <Link href="/dashboard">
                <Button variant="secondary" size="sm">Dashboard</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={disconnect} className="text-xs sm:text-sm px-2 sm:px-3">
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={connect} size="md">
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </Button>
          )}
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center sm:pt-40 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <Badge variant="premium" className="px-4 py-2 gap-2 text-sm backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <span className="w-2 h-2 rounded-full bg-premium animate-pulse" />
            Powered by Soroban Smart Contracts
          </Badge>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-br from-white via-text-primary to-text-muted pb-4 leading-tight"
        >
          Create. Share. <br/> <span className="text-transparent bg-clip-text bg-primary-cta">Get Paid.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mt-6 text-lg sm:text-xl text-text-secondary leading-relaxed font-light"
        >
          Borderless invoicing built for the modern internet. Send professional invoices and receive fast, low-fee payments in XLM or USDC instantly.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-12"
        >
          {address ? (
            <Link href="/dashboard">
              <Button size="lg" className="px-8 shadow-[var(--shadow-premium-button)]">
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <Button size="lg" onClick={connect} className="px-8 shadow-[var(--shadow-premium-button)]">
              Start Invoicing
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid w-full grid-cols-1 gap-6 mt-32 sm:grid-cols-3 text-left relative z-20"
        >
          {[
            { icon: Globe, title: "Borderless Payments", desc: "Settle invoices instantly across the globe with virtually zero fees on Stellar." },
            { icon: ShieldCheck, title: "On-Chain Verification", desc: "Every invoice and payment is immutably recorded via Soroban smart contracts." },
            { icon: Zap, title: "USDC & XLM Ready", desc: "Get paid in stablecoins or native XLM, giving you flexibility and stability." }
          ].map((feature, i) => (
            <Card key={i} variant="glass" padding="lg" className="hover:-translate-y-2 transition-transform duration-300">
              <div className="flex items-center justify-center w-14 h-14 mb-6 rounded-2xl bg-stellar-blue/10 text-stellar-blue border border-stellar-blue/20">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white tracking-tight">{feature.title}</h3>
              <p className="text-text-secondary text-base leading-relaxed font-light">{feature.desc}</p>
            </Card>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
