"use client";

import { useState, useEffect } from "react";
import { X, Wallet, FileText, Share2, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

const ONBOARDING_STEPS = [
  {
    title: "Connect Freighter Wallet",
    description: "Start by connecting your non-custodial Stellar wallet to sign cryptographic ledger transactions.",
    icon: <Wallet className="text-stellar-blue w-12 h-12 mb-4" />
  },
  {
    title: "Issue Blockchain Invoice",
    description: "Draft an invoice with client coordinates and amount in XLM or USDC. Terms are locked on-chain.",
    icon: <FileText className="text-emerald w-12 h-12 mb-4" />
  },
  {
    title: "Share & Instant Settle",
    description: "Distribute your public payment link. Clients scan the SEP-0007 QR code or pay with one click.",
    icon: <Share2 className="text-premium w-12 h-12 mb-4" />
  }
];

export function Onboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("stellar_invoice_onboarding_completed");
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("stellar_invoice_onboarding_completed", "true");
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible) return null;

  const step = ONBOARDING_STEPS[currentStep];
  if (!step) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel bg-[#132238]/95 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden backdrop-blur-2xl"
      >
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
          <div className="flex space-x-1.5">
            {ONBOARDING_STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                  i === currentStep 
                    ? 'bg-primary-cta w-12' 
                    : i < currentStep 
                    ? 'bg-stellar-blue/50' 
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <button 
            onClick={handleClose}
            className="text-text-muted hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              {step.icon}
              <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
              <p className="text-text-secondary font-light text-sm max-w-sm leading-relaxed">{step.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-5 border-t border-white/5 bg-white/5 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="p-2 text-text-muted hover:text-white disabled:opacity-0 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <Button
            onClick={nextStep}
            size="md"
            className="shadow-[var(--shadow-premium-button)] text-xs font-bold"
          >
            <span>{currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next Step'}</span>
            {currentStep < ONBOARDING_STEPS.length - 1 && <ChevronRight size={14} className="ml-1" />}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
