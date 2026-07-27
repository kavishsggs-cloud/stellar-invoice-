"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStellar } from "../providers/StellarProvider";
import { 
  Wallet, ArrowRight, Zap, Globe, ShieldCheck, Hexagon, 
  ChevronDown, Cpu, Key, FileText, CheckCircle2, AlertCircle, 
  DollarSign, Terminal, Layers, Star, Plus, Minus
} from "lucide-react";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tooltip } from "../components/ui/Tooltip";

// 1. Walkthrough Lifecycle Stages
const LIFE_STAGES = [
  {
    id: "create",
    label: "1. Create",
    title: "Draft & Issue Invoice",
    desc: "Draft professional billing receipts with client wallet coordinates, amount, and custom metadata.",
  },
  {
    id: "share",
    label: "2. Share",
    title: "Secure Cryptographic Link",
    desc: "Generate a borderless receipt link with embedded SEP-0007 QR code capabilities.",
  },
  {
    id: "pay",
    label: "3. Pay",
    title: "Freighter Wallet Sign",
    desc: "Clients securely connect wallets and approve ledger payments in native XLM or USDC stablecoins.",
  },
  {
    id: "verify",
    label: "4. Verify",
    title: "Soroban Smart Contract",
    desc: "Transactions execute instantly via Soroban logic, locking state changes on the immutable Stellar blockchain.",
  },
  {
    id: "settle",
    label: "5. Analytics",
    title: "Dashboard Integration",
    desc: "Successful payments immediately propagate to your real-time performance analytics metrics.",
  }
];

export default function LandingPage() {
  const { address, connect, disconnect } = useStellar();
  const [activeStage, setActiveStage] = useState("create");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen text-text-primary overflow-x-hidden font-sans relative pb-20 selection:bg-stellar-blue selection:text-white">
      
      {/* SECTION 1: HEADER & NAVBAR */}
      <nav className="relative z-50 flex items-center justify-between px-6 sm:px-12 py-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 text-xl sm:text-2xl font-bold tracking-tight"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-cta shadow-[var(--shadow-premium-button)]">
            <Hexagon className="h-6 w-6 text-white animate-spin-slow" strokeWidth={2.5} />
          </div>
          <span className="hidden min-[380px]:inline bg-clip-text text-transparent bg-gradient-to-r from-white to-text-secondary">Stellar Invoice</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="hidden md:flex items-center gap-6 mr-6 text-sm font-medium text-text-secondary">
            <a href="#problem" className="hover:text-white transition-colors">Compare</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#walkthrough" className="hover:text-white transition-colors">Walkthrough</a>
            <a href="#developer" className="hover:text-white transition-colors">Developer</a>
          </div>

          {address ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <Badge variant="neutral" className="hidden sm:inline-flex px-4 py-2 text-sm font-mono backdrop-blur-md">
                {formatAddress(address)}
              </Badge>
              <Link href="/dashboard">
                <Button variant="secondary" size="sm">Dashboard</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={disconnect} className="text-xs sm:text-sm px-2 sm:px-3 text-danger hover:bg-danger/10">
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={connect} size="md" className="shadow-[var(--shadow-premium-button)]">
              <Wallet className="w-4 h-4 mr-2" />
              <span>Connect Wallet</span>
            </Button>
          )}
        </motion.div>
      </nav>

      {/* SECTION 2: HERO WITH FLOATING MOCKUPS */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-20 sm:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Hero Content Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 text-left space-y-8"
          >
            <Badge variant="premium" className="px-4 py-2 gap-2 text-sm backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <span className="w-2 h-2 rounded-full bg-premium animate-pulse" />
              Soroban Smart Contract Architecture
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-text-primary to-text-muted leading-[1.1] pb-2">
              Next-Gen <br />
              <span className="text-transparent bg-clip-text bg-primary-cta">Borderless Billing</span>
            </h1>

            <p className="text-lg text-text-secondary leading-relaxed font-light max-w-lg">
              Unlock instant global settlement. Send cryptographic invoices that execute on the Stellar ledger, ensuring trust, low transaction fees, and verification.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
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
              <a href="#walkthrough">
                <Button variant="secondary" size="lg">
                  See Walkthrough
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/5">
              <div>
                <p className="text-3xl font-black text-white">&lt; 5s</p>
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">Settlement Speed</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">&lt; $0.01</p>
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">Average Fee</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">100%</p>
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">On-Chain Audit</p>
              </div>
            </div>
          </motion.div>

          {/* Immersive Dashboard Preview Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-6 relative"
          >
            {/* Ambient Background glow behind mockup */}
            <div className="absolute inset-0 bg-glass-glow rounded-3xl blur-3xl opacity-60 pointer-events-none scale-90" />
            
            <Card variant="glass" padding="none" className="overflow-hidden border-white/10 shadow-2xl relative">
              <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-danger/60" />
                  <div className="w-3.5 h-3.5 rounded-full bg-warning/60" />
                  <div className="w-3.5 h-3.5 rounded-full bg-success/60" />
                </div>
                <div className="text-xs font-mono text-text-muted px-4 py-1 bg-white/5 rounded-md border border-white/5">
                  stellar-ledger-preview.live
                </div>
                <div className="w-8" />
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Total Revenue</p>
                    <p className="text-3xl font-bold text-white mt-1">42,950.00 <span className="text-sm font-normal text-stellar-blue">XLM</span></p>
                  </div>
                  <Badge variant="success">Active Node</Badge>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Live On-Chain Feeds</p>
                  
                  {/* Floating simulated invoices */}
                  <div className="space-y-3">
                    <motion.div 
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="p-4 bg-surface/50 border border-white/5 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-stellar-blue/10 flex items-center justify-center text-stellar-blue">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">INV-84920</p>
                          <p className="text-xs text-text-muted">Client: Stark Enterprises</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">1,500.00 XLM</p>
                        <Badge variant="success" className="mt-1">Paid</Badge>
                      </div>
                    </motion.div>

                    <motion.div 
                      animate={{ y: [0, 3, 0] }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                      className="p-4 bg-surface/50 border border-white/5 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-premium/10 flex items-center justify-center text-premium">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">INV-84921</p>
                          <p className="text-xs text-text-muted">Client: Wayne Group</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">3,200.00 XLM</p>
                        <Badge variant="warning" className="mt-1">Pending</Badge>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs text-text-muted border-t border-white/5 font-mono">
                  <span>Block Hash: c4f82a9...</span>
                  <span className="flex items-center text-emerald">
                    <span className="w-2 h-2 rounded-full bg-emerald animate-ping mr-2" />
                    Ledger Synchronized
                  </span>
                </div>
              </div>
            </Card>

            {/* Scroll Indicator */}
            <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1.5 opacity-60">
              <span className="text-xs text-text-muted uppercase tracking-widest font-semibold">Scroll Down</span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronDown size={18} className="text-stellar-blue" />
              </motion.div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* SECTION 3: TRUSTED BY BANNER */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-24 text-center">
        <p className="text-xs text-text-muted uppercase tracking-widest font-bold mb-8">Empowering Decentralized Enterprise Architecture</p>
        <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-20 opacity-40">
          <span className="text-xl font-bold font-mono tracking-widest">S T E L L A R</span>
          <span className="text-xl font-bold font-mono tracking-widest">S O R O B A N</span>
          <span className="text-xl font-bold font-mono tracking-widest">V E R C E L</span>
          <span className="text-xl font-bold font-mono tracking-widest">F R E I G H T E R</span>
        </div>
      </section>

      {/* SECTION 4: PROBLEM & SOLUTION COMPARE */}
      <section id="problem" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-20 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="neutral">The Shift</Badge>
          <h2 className="text-4xl font-bold text-white tracking-tight mt-4">Tear Down Old Financial Rail Hurdles</h2>
          <p className="text-text-secondary font-light mt-3">Compare traditional invoice collection paths against Stellar Invoice’s instant cryptographic solution.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Legacy Bank Card */}
          <Card variant="solid" className="border-danger/10 hover:border-danger/25 transition-all">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger">
                <AlertCircle size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Legacy Settlement Path</h3>
            </div>
            
            <ul className="space-y-4 text-sm text-text-secondary font-light">
              <li className="flex items-center"><Minus size={14} className="text-danger mr-2 flex-shrink-0" /> Wire transfers require 3-5 business days to clear.</li>
              <li className="flex items-center"><Minus size={14} className="text-danger mr-2 flex-shrink-0" /> Steep wire settlement charges ($25 - $40 per payment).</li>
              <li className="flex items-center"><Minus size={14} className="text-danger mr-2 flex-shrink-0" /> No automatic validation; tedious ledger audits.</li>
              <li className="flex items-center"><Minus size={14} className="text-danger mr-2 flex-shrink-0" /> Prone to manual bank matching discrepancies.</li>
            </ul>
          </Card>

          {/* Stellar Invoice Card */}
          <Card variant="glass" className="border-success/10 hover:border-success/25 transition-all relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 blur-2xl rounded-full" />
            <div className="flex items-center space-x-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Stellar Invoice Path</h3>
            </div>

            <ul className="space-y-4 text-sm text-text-secondary font-light relative z-10">
              <li className="flex items-center"><Plus size={14} className="text-success mr-2 flex-shrink-0" /> Ledger settlement executes in under 5 seconds.</li>
              <li className="flex items-center"><Plus size={14} className="text-success mr-2 flex-shrink-0" /> Fractional network gas fees (less than $0.0001).</li>
              <li className="flex items-center"><Plus size={14} className="text-success mr-2 flex-shrink-0" /> Automated contract verification updates paid state.</li>
              <li className="flex items-center"><Plus size={14} className="text-success mr-2 flex-shrink-0" /> Fully transparent, immutable public audit trail.</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* SECTION 5: FEATURES BENTO GRID */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-20 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="premium">Bento Capabilities</Badge>
          <h2 className="text-4xl font-bold text-white tracking-tight mt-4">Built for Stellar Mastery</h2>
          <p className="text-text-secondary font-light mt-3">An elite suite designed to address next-generation business transaction cycles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card variant="glass" padding="lg" className="md:col-span-2 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-stellar-blue/10 text-stellar-blue flex items-center justify-center mb-6">
              <Globe size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Borderless Token Selection</h3>
            <p className="text-text-secondary font-light text-sm leading-relaxed">
              Accept invoice settlement natively in Lumens (XLM) or settle directly using USDC stablecoins. Ensure price stability or direct currency liquidity depending on your business rules.
            </p>
          </Card>

          <Card variant="highlight" padding="lg" className="hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center mb-6">
              <Cpu size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Smart Lock States</h3>
            <p className="text-text-secondary font-light text-sm leading-relaxed">
              Soroban smart contracts guard payment transactions, validation, and metadata storage. Zero custody of client capital.
            </p>
          </Card>

          <Card variant="glass" padding="lg" className="hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-emerald/10 text-emerald flex items-center justify-center mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Wallet Onboarding</h3>
            <p className="text-text-secondary font-light text-sm leading-relaxed">
              Onboard clients directly through Freighter wallet connections or generate quick SEP-0007 payments dynamically.
            </p>
          </Card>

          <Card variant="glass" padding="lg" className="md:col-span-2 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-premium/10 text-premium flex items-center justify-center mb-6">
              <Layers size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Integrated Live Timeline Analytics</h3>
            <p className="text-text-secondary font-light text-sm leading-relaxed">
              Every on-chain invoice action propagates stats instantly. Monitor paid balances, transaction hashes, and payment timelines on your custom dashboard charts.
            </p>
          </Card>

        </div>
      </section>

      {/* SECTION 6: PRODUCT WALKTHROUGH LIFECYCLE SIMULATOR */}
      <section id="walkthrough" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-20 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5 space-y-8">
            <div>
              <Badge variant="premium">Interactive Lifecycle</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4">Interactive Invoice Simulator</h2>
              <p className="text-text-secondary font-light mt-3">Click the stages to trace a transaction's journey from creation to final settlement.</p>
            </div>

            <div className="space-y-4">
              {LIFE_STAGES.map((stage) => {
                const isActive = activeStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setActiveStage(stage.id)}
                    className="w-full text-left focus:outline-none block"
                  >
                    <div className={`p-4 rounded-2xl border transition-all ${
                      isActive 
                        ? "bg-white/5 border-stellar-blue/30 shadow-md" 
                        : "border-transparent hover:bg-white/5"
                    }`}>
                      <p className={`text-sm font-bold ${isActive ? "text-stellar-blue" : "text-text-muted"}`}>
                        {stage.label}
                      </p>
                      <h4 className="text-base font-bold text-white mt-1">{stage.title}</h4>
                      {isActive && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-xs text-text-secondary font-light mt-2 leading-relaxed"
                        >
                          {stage.desc}
                        </motion.p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7">
            <Card variant="glass" padding="none" className="overflow-hidden border-white/10 shadow-2xl relative h-[420px] flex flex-col">
              
              <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-mono text-stellar-blue uppercase tracking-wider font-semibold">Active Story Simulation</span>
                <span className="text-xs font-mono text-text-muted">Ledger State: Live</span>
              </div>

              <div className="flex-1 p-8 flex items-center justify-center relative bg-slate-bg/30">
                <AnimatePresence mode="wait">
                  
                  {activeStage === "create" && (
                    <motion.div
                      key="create"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="w-full max-w-sm space-y-4 bg-surface/50 border border-white/10 rounded-2xl p-6 shadow-xl"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-text-secondary uppercase">Drafting Receipt</span>
                        <Badge variant="neutral">USDC</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="h-6 bg-white/5 rounded-md w-3/4 animate-pulse" />
                        <div className="h-6 bg-white/5 rounded-md w-1/2 animate-pulse" />
                      </div>
                      <div className="pt-2 flex justify-end">
                        <div className="h-8 bg-stellar-blue/20 rounded-md w-28 animate-pulse" />
                      </div>
                    </motion.div>
                  )}

                  {activeStage === "share" && (
                    <motion.div
                      key="share"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="w-full max-w-xs text-center space-y-6 bg-surface/50 border border-white/10 rounded-2xl p-6 shadow-xl"
                    >
                      <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Generated Payment Link</span>
                      <div className="w-36 h-36 bg-white p-3 rounded-xl mx-auto shadow-md">
                        <div className="w-full h-full bg-[radial-gradient(circle,_#132238_30%,_transparent_40%)] bg-[size:10px_10px]" />
                      </div>
                      <span className="text-xs text-stellar-blue font-mono">stellar-invoice/pay/48201</span>
                    </motion.div>
                  )}

                  {activeStage === "pay" && (
                    <motion.div
                      key="pay"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="w-full max-w-sm bg-[#132238] border border-white/10 rounded-2xl p-6 shadow-2xl"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <Wallet className="text-stellar-blue" size={24} />
                        <h4 className="font-bold text-white">Freighter Signature Request</h4>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed mb-6">
                        Approve paying 1,500.00 XLM from G...842K to contract CBPNGAIA...
                      </p>
                      <div className="flex justify-end space-x-3">
                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold">Reject</button>
                        <button className="px-4 py-2 bg-stellar-blue text-white rounded-lg text-xs font-bold shadow-md">Confirm Sign</button>
                      </div>
                    </motion.div>
                  )}

                  {activeStage === "verify" && (
                    <motion.div
                      key="verify"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="text-center space-y-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto text-success border border-success/30 shadow-lg">
                        <CheckCircle2 size={32} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">On-Chain Executed</h4>
                        <p className="text-xs text-text-muted mt-1 font-mono">Tx: cf9c0a66... confirmed in block 49821</p>
                      </div>
                    </motion.div>
                  )}

                  {activeStage === "settle" && (
                    <motion.div
                      key="settle"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full max-w-md bg-surface/50 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-text-secondary uppercase">Revenue Analytics</span>
                        <Badge variant="success">+1,500.00 XLM</Badge>
                      </div>
                      
                      <div className="h-28 flex items-end gap-2 pt-2">
                        <div className="bg-white/5 w-full h-[30%] rounded-md" />
                        <div className="bg-white/5 w-full h-[55%] rounded-md" />
                        <div className="bg-white/5 w-full h-[45%] rounded-md" />
                        <motion.div 
                          initial={{ height: 0 }} 
                          animate={{ height: "85%" }} 
                          className="bg-primary-cta w-full rounded-md shadow-lg" 
                        />
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </Card>
          </div>

        </div>
      </section>

      {/* SECTION 7: WHY STELLAR (STATS & INFO) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-20 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <Badge variant="premium">Ledger Integration</Badge>
            <h2 className="text-4xl font-bold text-white tracking-tight">The Stellar & Soroban Edge</h2>
            <p className="text-text-secondary font-light leading-relaxed">
              Stellar is custom-engineered for digital asset routing, borderless payments, and high-performance financial systems. With the integration of Soroban smart contracts, invoice terms are executed directly on-chain without intermediates.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-md bg-stellar-blue/10 flex items-center justify-center text-stellar-blue mt-1">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Fractional Stroop Gas Fees</p>
                  <p className="text-xs text-text-secondary mt-0.5">Scale operations with virtually zero platform transaction overhead.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-md bg-stellar-blue/10 flex items-center justify-center text-stellar-blue mt-1">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Trust-Free Escrow Capabilities</p>
                  <p className="text-xs text-text-secondary mt-0.5">Invoices are cryptographically bound to recipient addresses.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-6">
            <div className="bg-surface/50 border border-white/5 p-6 rounded-2xl">
              <h4 className="text-3xl font-extrabold text-white">5 Sec</h4>
              <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">Stellar Block Confirmation</p>
            </div>
            <div className="bg-surface/50 border border-white/5 p-6 rounded-2xl">
              <h4 className="text-3xl font-extrabold text-white">100%</h4>
              <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">Freighter Key Custody</p>
            </div>
            <div className="bg-surface/50 border border-white/5 p-6 rounded-2xl">
              <h4 className="text-3xl font-extrabold text-white">&lt; $0.0001</h4>
              <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">Average Settle Cost</p>
            </div>
            <div className="bg-surface/50 border border-white/5 p-6 rounded-2xl">
              <h4 className="text-3xl font-extrabold text-white">USDC / XLM</h4>
              <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">Multi-Asset Support</p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 8: HOW IT WORKS */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-20 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="neutral">The Mechanics</Badge>
          <h2 className="text-4xl font-bold text-white tracking-tight mt-4">Simple On-Chain Workflows</h2>
          <p className="text-text-secondary font-light mt-3">Three simple steps to coordinate billing globally.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-stellar-blue/15 text-stellar-blue font-bold flex items-center justify-center">1</div>
            <h3 className="text-lg font-bold text-white">Deploy Contract Invoice</h3>
            <p className="text-sm text-text-secondary font-light leading-relaxed">
              Connect your Freighter wallet, specify client coordinates and terms, and sign the creation transaction.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-stellar-blue/15 text-stellar-blue font-bold flex items-center justify-center">2</div>
            <h3 className="text-lg font-bold text-white">Distribute Payment Link</h3>
            <p className="text-sm text-text-secondary font-light leading-relaxed">
              Send the generated cryptographic invoice details to the client or let them scan the SEP-0007 QR code.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-stellar-blue/15 text-stellar-blue font-bold flex items-center justify-center">3</div>
            <h3 className="text-lg font-bold text-white">Instant Ledger Settle</h3>
            <p className="text-sm text-text-secondary font-light leading-relaxed">
              Once paid, the Soroban smart contract automatically sets paid flags, instantly updating your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 9: SMART CONTRACT FLOW (DEVELOPER EXPERIENCE) */}
      <section id="developer" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-20 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <Badge variant="premium">Developer Experience</Badge>
            <h2 className="text-4xl font-bold text-white tracking-tight">Soroban Smart Contract Logic</h2>
            <p className="text-text-secondary font-light leading-relaxed">
              Inspect the underlying code. The ledger stores invoice details using optimized Rust contracts, eliminating single-point-of-failure servers.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="neutral" className="font-mono">invoice_contract.rs</Badge>
              <Badge variant="neutral" className="font-mono">WASM Optimized</Badge>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Card variant="solid" padding="none" className="overflow-hidden border-white/10 shadow-2xl">
              <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Terminal className="text-stellar-blue" size={16} />
                  <span className="text-xs font-mono text-text-secondary">invoice_contract.rs</span>
                </div>
                <Badge variant="neutral">Rust / Soroban</Badge>
              </div>

              <div className="p-6 overflow-x-auto font-mono text-[11px] sm:text-xs text-text-secondary leading-relaxed bg-[#0B1728]/50">
                <pre>{`#[contractimpl]
impl InvoiceContract {
    pub fn create_invoice(
        env: Env,
        creator: Address,
        recipient: Address,
        amount: i128,
        dueDate: u64
    ) -> u64 {
        creator.require_auth();
        
        let id = get_next_id(&env);
        let invoice = Invoice {
            id, creator, recipient, amount, dueDate,
            status: InvoiceStatus::Pending
        };
        
        env.storage().persistent().set(&id, &invoice);
        id
    }
}`}</pre>
              </div>
            </Card>
          </div>

        </div>
      </section>

      {/* SECTION 10: ON-CHAIN SECURITY & TRUST */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-20 border-t border-white/5 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <Badge variant="neutral">Security Protocol</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Non-Custodial Account Operations</h2>
          <p className="text-text-secondary font-light leading-relaxed">
            Stellar Invoice does not store seed phrases or private keys. All cryptographic signature confirmations are securely routed and handled locally inside your browser via Freighter. You retain full control of your keys and funds at all times.
          </p>
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs text-text-secondary font-mono">
            <Key size={14} className="text-stellar-blue" />
            <span>Network: testnet | pass: Test SDF Network...</span>
          </div>
        </div>
      </section>

      {/* SECTION 11: TESTIMONIALS */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-20 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="premium">Testimonials</Badge>
          <h2 className="text-4xl font-bold text-white tracking-tight mt-4">Adopted by Leading Creators</h2>
          <p className="text-text-secondary font-light mt-3">Read what developers and companies say about transition speeds on Stellar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { quote: "Replacing legacy ACH wire transfers with Stellar Invoice reduced our settlement timelines from 4 days to 4 seconds.", author: "Alex Rivers", role: "CTO, Finova Tech" },
            { quote: "The Freighter wallet integration combined with live Soroban contract validation guarantees a secure and fully non-custodial accounting stream.", author: "Elena Rostova", role: "Founder, DecentLabs" },
            { quote: "Having instant, micro-fee invoice settlement in USDC has completely optimized our international freelancer payouts.", author: "Marcus Vance", role: "Head of Finance, CloudScale" }
          ].map((item, i) => (
            <Card key={i} variant="glass" padding="lg" className="flex flex-col justify-between">
              <div className="flex items-center space-x-1 mb-6 text-warning">
                {[1,2,3,4,5].map(star => <Star key={star} size={14} fill="currentColor" />)}
              </div>
              <p className="text-sm text-text-secondary font-light italic leading-relaxed">&quot;{item.quote}&quot;</p>
              <div className="mt-8 pt-4 border-t border-white/5">
                <p className="text-sm font-bold text-white">{item.author}</p>
                <p className="text-xs text-text-muted mt-0.5">{item.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 12: PRICING (SaaS tier) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-20 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="neutral">SaaS Tiers</Badge>
          <h2 className="text-4xl font-bold text-white tracking-tight mt-4">Simple, Transparent Pricing</h2>
          <p className="text-text-secondary font-light mt-3">Choose the model that fits your transaction frequency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <Card variant="glass" padding="lg" className="flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Stellar Basic</h3>
              <p className="text-sm text-text-muted mt-2">Perfect for freelancers and individual contractors.</p>
              <div className="my-6">
                <span className="text-5xl font-black text-white">$0</span>
                <span className="text-sm text-text-muted ml-2">/ month</span>
              </div>
              <ul className="space-y-3 text-sm text-text-secondary font-light mb-8">
                <li className="flex items-center"><CheckCircle2 size={14} className="text-stellar-blue mr-2" /> Unlimited invoice drafting</li>
                <li className="flex items-center"><CheckCircle2 size={14} className="text-stellar-blue mr-2" /> Freighter wallet sign checks</li>
                <li className="flex items-center"><CheckCircle2 size={14} className="text-stellar-blue mr-2" /> Standard SEP-0007 QR Codes</li>
              </ul>
            </div>
            {address ? (
              <Link href="/dashboard">
                <Button className="w-full">Get Started</Button>
              </Link>
            ) : (
              <Button onClick={connect} className="w-full">Connect Wallet</Button>
            )}
          </Card>

          {/* Premium Tier */}
          <Card variant="solid" padding="lg" className="border-stellar-blue/30 relative flex flex-col justify-between shadow-[0_0_30px_rgba(8,181,229,0.1)]">
            <div className="absolute top-4 right-4">
              <Badge variant="premium">Coming Soon</Badge>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Enterprise Node</h3>
              <p className="text-sm text-text-muted mt-2">Designed for corporate operations scaling global invoicing.</p>
              <div className="my-6">
                <span className="text-5xl font-black text-white">$49</span>
                <span className="text-sm text-text-muted ml-2">/ month</span>
              </div>
              <ul className="space-y-3 text-sm text-text-secondary font-light mb-8">
                <li className="flex items-center"><CheckCircle2 size={14} className="text-emerald mr-2" /> Automated invoice email distribution</li>
                <li className="flex items-center"><CheckCircle2 size={14} className="text-emerald mr-2" /> API access for ERP system syncs</li>
                <li className="flex items-center"><CheckCircle2 size={14} className="text-emerald mr-2" /> Dedicated smart contract deployments</li>
              </ul>
            </div>
            <Button variant="secondary" className="w-full cursor-not-allowed opacity-50" disabled>Coming Soon</Button>
          </Card>
        </div>
      </section>

      {/* SECTION 13: FAQ */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-white/5">
        <h2 className="text-3xl font-bold text-center text-white tracking-tight mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "Do I need funds to create an invoice?", a: "No! Creating/issuing an invoice writes metadata to the Soroban contract which requires a Freighter signature, but gas charges are extremely minor (fractions of a cent) and are covered dynamically on Testnet. Paying an invoice, however, requires holding the billing balance in your wallet." },
            { q: "What is Soroban?", a: "Soroban is Stellar's state-of-the-art WebAssembly (WASM) smart contract platform. It enables building secure, transactional execution scripts on top of the Stellar network." },
            { q: "How are clients notified of payment requests?", a: "Upon saving the invoice details to the contract, a payment receipt page is generated. You can share this link directly with your client via email or communication channels. They can open it, connect Freighter, and complete the settlement." }
          ].map((item, index) => {
            const isOpen = activeFaq === index;
            return (
              <Card key={index} variant="glass" padding="none" className="overflow-hidden">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between focus:outline-none"
                >
                  <span className="font-bold text-white text-sm sm:text-base">{item.q}</span>
                  <span className="text-text-muted">{isOpen ? <Minus size={18} /> : <Plus size={18} />}</span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-xs sm:text-sm text-text-secondary leading-relaxed font-light border-t border-white/5 pt-4"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FINAL CTA & FOOTER */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <Card variant="solid" padding="lg" className="border-white/10 relative overflow-hidden bg-gradient-to-br from-[#0B1728] to-[#06121F]">
          <div className="absolute inset-0 bg-glass-glow rounded-3xl blur-3xl opacity-30 pointer-events-none scale-75" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Ready to Settle Payments Instantly?</h2>
          <p className="text-text-secondary font-light mt-3 max-w-xl mx-auto">
            Connect your Freighter wallet now to issue, track, and collect cryptographic invoices on the Stellar Testnet.
          </p>
          <div className="mt-8 flex justify-center">
            {address ? (
              <Link href="/dashboard">
                <Button size="lg" className="shadow-[var(--shadow-premium-button)]">Go to Dashboard</Button>
              </Link>
            ) : (
              <Button size="lg" onClick={connect} className="shadow-[var(--shadow-premium-button)]">Connect Freighter</Button>
            )}
          </div>
        </Card>
      </section>

      <footer className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-16 border-t border-white/5 text-center text-xs text-text-muted">
        <p>&copy; {new Date().getFullYear()} Stellar Invoice. Engineered under open-source Soroban specifications. All rights reserved.</p>
      </footer>

    </div>
  );
}
