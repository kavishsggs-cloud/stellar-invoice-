"use client";

import { useState, useEffect } from "react";
import {
  X,
  Wallet,
  FileText,
  Share2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

const ONBOARDING_STEPS = [
  {
    title: "Connect Stellar Wallet",
    description:
      "Start by connecting your non-custodial Stellar wallet (Freighter, xBull, or Albedo) to sign cryptographic ledger transactions.",
    icon: <Wallet className="text-[#cbfffc] w-12 h-12 mb-4" />,
  },
  {
    title: "Issue Soroban Invoice",
    description:
      "Draft an invoice with client coordinates and amount in XLM or USDC. Terms are locked on-chain in smart contracts.",
    icon: <FileText className="text-[#edfffe] w-12 h-12 mb-4" />,
  },
  {
    title: "Share & Instant Settle",
    description:
      "Distribute your public payment link. Clients scan the SEP-0007 QR code or pay with one click.",
    icon: <Share2 className="text-[#fde9ff] w-12 h-12 mb-4" />,
  },
];

export function Onboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(
      "stellar_invoice_onboarding_completed",
    );
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#011d1c]/90 backdrop-blur-md px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#003734] border border-[#cbfffc]/20 rounded-[16px] w-full max-w-lg shadow-none overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-[#cbfffc]/10 bg-[#012624]">
          <div className="flex space-x-2">
            {ONBOARDING_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-[3px] transition-all duration-300 ${
                  i === currentStep
                    ? "bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] w-12"
                    : i < currentStep
                      ? "bg-[#00827c] w-8"
                      : "bg-[#cbfffc]/10 w-8"
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleClose}
            className="text-[#bbc7c6] hover:text-[#ffffff] transition-colors p-1"
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
              <h2 className="text-2xl font-medium text-[#ffffff] mb-3">
                {step.title}
              </h2>
              <p className="text-[#bbc7c6] font-normal text-sm max-w-sm leading-[1.4]">
                {step.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-5 border-t border-[#cbfffc]/10 bg-[#012624] flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="p-2 text-[#bbc7c6] hover:text-[#ffffff] disabled:opacity-0 transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          <Button
            onClick={nextStep}
            className="bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] text-[#011d1c] font-medium text-[13px] uppercase tracking-[0.05em] rounded-[6px] px-6 py-2.5 hover:opacity-90 shadow-none border-0"
          >
            <span>
              {currentStep === ONBOARDING_STEPS.length - 1
                ? "Get Started"
                : "Next Step"}
            </span>
            {currentStep < ONBOARDING_STEPS.length - 1 && (
              <ChevronRight size={14} className="ml-1 inline" />
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
