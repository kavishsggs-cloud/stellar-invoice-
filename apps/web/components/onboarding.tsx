"use client";

import { useState, useEffect } from "react";
import { X, Wallet, FileText, Share2, ChevronRight, ChevronLeft } from "lucide-react";
import { useWallet } from "../hooks/useWallet";

const ONBOARDING_STEPS = [
  {
    title: "Connect Wallet",
    description: "Start by connecting your Stellar wallet (like Freighter) to interact with the network and receive payments.",
    icon: <Wallet className="text-blue-500 w-12 h-12 mb-4" />
  },
  {
    title: "Create an Invoice",
    description: "Generate a new invoice specifying the client, amount in XLM or USDC, and due date. The invoice is securely logged.",
    icon: <FileText className="text-blue-500 w-12 h-12 mb-4" />
  },
  {
    title: "Share and Get Paid",
    description: "Share the unique public invoice link with your client. They can scan the QR code or pay directly from their wallet.",
    icon: <Share2 className="text-blue-500 w-12 h-12 mb-4" />
  }
];

export function Onboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { address } = useWallet();

  useEffect(() => {
    // Check if the user has completed onboarding
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <div className="flex space-x-1">
            {ONBOARDING_STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 w-8 rounded-full transition-colors ${i === currentStep ? 'bg-blue-500' : i < currentStep ? 'bg-blue-500/50' : 'bg-zinc-800'}`}
              />
            ))}
          </div>
          <button 
            onClick={handleClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          {step.icon}
          <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
          <p className="text-zinc-400 max-w-sm">{step.description}</p>
        </div>

        <div className="p-4 bg-zinc-950 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="p-2 text-zinc-500 hover:text-white disabled:opacity-0 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={nextStep}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <span>{currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}</span>
            {currentStep < ONBOARDING_STEPS.length - 1 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
