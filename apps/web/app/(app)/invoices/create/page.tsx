"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../../hooks/useWallet";
import { isValidAddress, InvoiceContractAPI, CONTRACT_ID, buildContractTransaction, submitTransaction } from "@repo/sdk";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Save, Users, FileSpreadsheet, Send, Calendar, HelpCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Tooltip } from "../../../../components/ui/Tooltip";

type Step = "client" | "details" | "review";

export default function CreateInvoice() {
  const { address, signTransaction } = useWallet();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<Step>("client");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    clientName: "",
    recipient: "",
    clientEmail: "",
    description: "",
    amount: "",
    asset: "native",
    memo: "",
    notes: "",
    dueDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load draft
    const draft = localStorage.getItem("invoice_draft");
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
        toast.info("Draft loaded successfully");
      } catch {
        // ignore
      }
    }
  }, []);

  const validate = (field: string, value: string) => {
    let error = "";
    switch (field) {
      case "clientName":
        if (!value) error = "Client name is required";
        break;
      case "recipient":
        if (!value) {
          error = "Wallet address is required";
        } else if (!isValidAddress(value)) {
          error = "Invalid Stellar address";
        }
        break;
      case "clientEmail":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Invalid email address";
        }
        break;
      case "description":
        if (!value) error = "Description is required";
        break;
      case "amount":
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          error = "Enter a valid positive amount";
        }
        break;
      case "dueDate":
        if (!value) {
          error = "Due date is required";
        } else if (new Date(value).getTime() < Date.now() - 86400000) {
          error = "Due date must be in the future";
        }
        break;
      case "memo":
        if (value.length > 28) error = "Memo too long (max 28 chars)";
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      localStorage.setItem("invoice_draft", JSON.stringify(next));
      return next;
    });
    validate(name, value);
  };

  const saveDraft = () => {
    localStorage.setItem("invoice_draft", JSON.stringify(formData));
    toast.success("Draft saved successfully!");
  };

  // Navigating between progressive steps with validation checks
  const handleNextStep = (next: Step) => {
    let fieldsToValidate: string[] = [];
    if (activeStep === "client") {
      fieldsToValidate = ["clientName", "recipient", "clientEmail"];
    } else if (activeStep === "details") {
      fieldsToValidate = ["description", "amount", "dueDate", "memo"];
    }

    let isValid = true;
    fieldsToValidate.forEach((field) => {
      if (!validate(field, formData[field as keyof typeof formData])) {
        isValid = false;
      }
    });

    if (isValid) {
      setActiveStep(next);
    } else {
      toast.error("Please resolve validation errors before continuing.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    let isValid = true;
    Object.keys(formData).forEach(key => {
      if (!validate(key, formData[key as keyof typeof formData])) {
        isValid = false;
      }
    });

    if (!isValid) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const api = new InvoiceContractAPI(CONTRACT_ID);
      const callData = api.getCallData("create_invoice", api.createInvoiceArgs({
        creator: address,
        clientName: formData.clientName,
        recipient: formData.recipient,
        clientEmail: formData.clientEmail,
        description: formData.description,
        amount: BigInt(Math.floor(Number(formData.amount) * 10000000)), // Convert XLM to stroops
        asset: formData.asset === "native" ? "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC" : formData.asset,
        memo: formData.memo,
        notes: formData.notes,
        dueDate: BigInt(new Date(formData.dueDate).getTime()),
      }));

      const xdr = await buildContractTransaction(address, callData);
      
      const signedXdr = await signTransaction(xdr).catch(() => {
        throw new Error("User rejected the transaction");
      });
      
      const result = await submitTransaction(signedXdr);

      if (result.status !== "SUCCESS") {
        throw new Error(`Transaction failed: ${result.status}`);
      }
      
      localStorage.removeItem("invoice_draft");
      
      toast.success("Invoice created successfully!");
      setSuccess(true);
      
      setTimeout(() => {
        router.push("/invoices");
      }, 2000);
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(e.message || "Failed to create invoice");
        setErrors({ submit: e.message || "Failed to create invoice" });
      } else {
        toast.error("Failed to create invoice");
        setErrors({ submit: "Failed to create invoice" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (success) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.3)]"
        >
          <CheckCircle2 className="text-success" size={48} />
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <h1 className="text-3xl font-bold text-white">Invoice Created!</h1>
          <p className="text-text-secondary mt-2 mb-6">Your invoice has been successfully recorded on the Stellar network.</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-text-muted bg-surface/50 py-3 rounded-2xl border border-white/5">
            <Loader2 className="animate-spin" size={16} /> 
            <span>Redirecting to invoices...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/invoices">
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full bg-white/5 hover:bg-white/10">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Create Invoice</h1>
            <p className="text-text-secondary mt-1">Issue a new blockchain billing record</p>
          </div>
        </div>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={saveDraft}
        >
          <Save size={16} className="mr-2" />
          <span>Save Draft</span>
        </Button>
      </motion.div>

      {/* Progressive Step Progress Indicator */}
      <motion.div variants={itemVariants} className="max-w-xl">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-text-muted mb-3">
          <span className={activeStep === "client" ? "text-stellar-blue font-bold" : ""}>1. Client Info</span>
          <span className={activeStep === "details" ? "text-stellar-blue font-bold" : ""}>2. Invoice Info</span>
          <span className={activeStep === "review" ? "text-stellar-blue font-bold" : ""}>3. Settle terms</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            animate={{
              width: activeStep === "client" ? "33%" : activeStep === "details" ? "66%" : "100%"
            }}
            transition={{ duration: 0.3 }}
            className="h-full bg-primary-cta"
          />
        </div>
      </motion.div>

      {/* Grid split view: form on the left, live invoice preview card mockup on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Active Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit}>
            <Card variant="glass" padding="lg" className="space-y-8">
              {errors.submit && (
                <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-sm flex items-center">
                  <div className="w-2 h-2 rounded-full bg-danger mr-3 animate-pulse"></div>
                  {errors.submit}
                </div>
              )}

              <AnimatePresence mode="wait">
                
                {/* STEP 1: CLIENT DETAILS */}
                {activeStep === "client" && (
                  <motion.div
                    key="client"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center space-x-3 border-b border-white/5 pb-3">
                      <Users className="text-stellar-blue" size={20} />
                      <h2 className="text-lg font-semibold text-white">Client Details</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-secondary">Client Name *</label>
                        <Input
                          type="text"
                          name="clientName"
                          value={formData.clientName}
                          onChange={handleChange}
                          error={!!errors.clientName}
                          placeholder="Acme Corp"
                        />
                        {errors.clientName && <p className="text-danger text-xs mt-1">{errors.clientName}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-secondary">Client Email <span className="text-text-muted">(Optional)</span></label>
                        <Input
                          type="email"
                          name="clientEmail"
                          value={formData.clientEmail}
                          onChange={handleChange}
                          error={!!errors.clientEmail}
                          placeholder="billing@acme.com"
                        />
                        {errors.clientEmail && <p className="text-danger text-xs mt-1">{errors.clientEmail}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-secondary">Client Stellar Address *</label>
                        <Input
                          type="text"
                          name="recipient"
                          value={formData.recipient}
                          onChange={handleChange}
                          error={!!errors.recipient}
                          placeholder="G..."
                          className="font-mono text-sm"
                        />
                        {errors.recipient && <p className="text-danger text-xs mt-1">{errors.recipient}</p>}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button type="button" onClick={() => handleNextStep("details")}>
                        Next Step
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: INVOICE DETAILS */}
                {activeStep === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center space-x-3 border-b border-white/5 pb-3">
                      <FileSpreadsheet className="text-stellar-blue" size={20} />
                      <h2 className="text-lg font-semibold text-white">Invoice details</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-secondary">Description *</label>
                        <Input
                          type="text"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          error={!!errors.description}
                          placeholder="Design Services - Phase 1"
                        />
                        {errors.description && <p className="text-danger text-xs mt-1">{errors.description}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-text-secondary">Amount *</label>
                          <div className="relative">
                            <Input
                              type="number"
                              name="amount"
                              step="0.0000001"
                              value={formData.amount}
                              onChange={handleChange}
                              error={!!errors.amount}
                              placeholder="100.00"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                              <span className="text-text-muted font-medium text-sm">{formData.asset === 'native' ? 'XLM' : 'USDC'}</span>
                            </div>
                          </div>
                          {errors.amount && <p className="text-danger text-xs mt-1">{errors.amount}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-text-secondary">Asset *</label>
                          <select
                            name="asset"
                            value={formData.asset}
                            onChange={handleChange}
                            className="flex h-12 w-full rounded-2xl border border-white/10 bg-surface/50 px-4 py-2 text-sm text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-stellar-blue/30 transition-all cursor-pointer"
                          >
                            <option value="native">XLM (Native)</option>
                            <option value="usdc">USDC</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-text-secondary">Due Date *</label>
                          <Input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            error={!!errors.dueDate}
                            className="[color-scheme:dark]"
                          />
                          {errors.dueDate && <p className="text-danger text-xs mt-1">{errors.dueDate}</p>}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-1.5">
                            <label className="block text-sm font-medium text-text-secondary font-sans">Stellar Memo</label>
                            <Tooltip content="Optional metadata string added to the transaction memo (max 28 chars)">
                              <HelpCircle size={14} className="text-text-muted cursor-help" />
                            </Tooltip>
                          </div>
                          <Input
                            type="text"
                            name="memo"
                            value={formData.memo}
                            onChange={handleChange}
                            error={!!errors.memo}
                            placeholder="Max 28 chars"
                            maxLength={28}
                          />
                          {errors.memo && <p className="text-danger text-xs mt-1">{errors.memo}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-text-secondary">Notes <span className="text-text-muted">(Optional)</span></label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows={3}
                          className="flex w-full rounded-2xl border border-white/10 bg-surface/50 px-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-stellar-blue/30 transition-all resize-none"
                          placeholder="Thank you for your business!"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button type="button" variant="secondary" onClick={() => setActiveStep("client")}>
                        Back
                      </Button>
                      <Button type="button" onClick={() => handleNextStep("review")}>
                        Next Step
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: REVIEW & SUBMIT */}
                {activeStep === "review" && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center space-x-3 border-b border-white/5 pb-3">
                      <Send className="text-stellar-blue" size={20} />
                      <h2 className="text-lg font-semibold text-white">Review & Submit</h2>
                    </div>

                    <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-text-muted">Client Name</p>
                          <p className="text-white font-medium mt-1">{formData.clientName}</p>
                        </div>
                        <div>
                          <p className="text-text-muted">Client Address</p>
                          <p className="text-white font-mono mt-1 truncate">{formData.recipient}</p>
                        </div>
                        <div>
                          <p className="text-text-muted">Total Amount</p>
                          <p className="text-white font-bold mt-1">{formData.amount} {formData.asset === 'native' ? 'XLM' : 'USDC'}</p>
                        </div>
                        <div>
                          <p className="text-text-muted">Due Date</p>
                          <p className="text-white font-medium mt-1">{formData.dueDate}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <Button type="button" variant="secondary" onClick={() => setActiveStep("details")}>
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="shadow-[var(--shadow-premium-button)]"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <Loader2 className="animate-spin mr-2" size={16} />
                            Publishing...
                          </span>
                        ) : (
                          "Publish to Ledger"
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </Card>
          </form>
        </div>

        {/* Live Card Mockup Preview Column */}
        <div className="lg:col-span-5 sticky top-8">
          <div className="text-xs font-mono uppercase tracking-widest text-text-muted mb-3 flex items-center justify-between">
            <span>Live Interactive Preview</span>
            <span className="flex items-center text-stellar-blue">
              <span className="w-1.5 h-1.5 rounded-full bg-stellar-blue animate-ping mr-2" />
              Sync active
            </span>
          </div>

          <Card variant="solid" padding="none" className="overflow-hidden border-white/10 shadow-2xl bg-slate-bg/60 backdrop-blur-md">
            
            {/* Header info */}
            <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Hexagon size={18} className="text-stellar-blue" />
                <span className="text-xs font-bold text-white tracking-wider uppercase">Stellar Receipt</span>
              </div>
              <Badge variant="warning">Draft</Badge>
            </div>

            {/* Receipt Summary */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-widest font-semibold">Amount Due</p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-4xl font-black text-white">{formData.amount || "0.00"}</span>
                  <span className="text-lg text-stellar-blue font-bold">{formData.asset === 'native' ? 'XLM' : 'USDC'}</span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                
                <div className="pb-4 border-b border-white/5">
                  <p className="text-text-muted uppercase tracking-wider mb-1 font-semibold text-[10px]">Bill To Client</p>
                  <p className="text-white font-bold text-sm truncate">{formData.clientName || "Acme Client Corp"}</p>
                  {formData.recipient && (
                    <p className="text-text-secondary font-mono mt-0.5 truncate">{formData.recipient}</p>
                  )}
                </div>

                <div className="pb-4 border-b border-white/5">
                  <p className="text-text-muted uppercase tracking-wider mb-1 font-semibold text-[10px]">Description</p>
                  <p className="text-white font-medium">{formData.description || "Web billing contract development..."}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-muted uppercase tracking-wider mb-1 font-semibold text-[10px]">Due Date</p>
                    <div className="flex items-center text-white">
                      <Calendar size={12} className="mr-1.5 text-text-muted" />
                      <span>{formData.dueDate || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-text-muted uppercase tracking-wider mb-1 font-semibold text-[10px]">Memo</p>
                    <p className="text-white font-mono truncate">{formData.memo || "None"}</p>
                  </div>
                </div>

                {formData.notes && (
                  <div>
                    <p className="text-text-muted uppercase tracking-wider mb-1 font-semibold text-[10px]">Notes</p>
                    <p className="text-text-secondary italic">&quot;{formData.notes}&quot;</p>
                  </div>
                )}

              </div>

            </div>

          </Card>
        </div>

      </div>

    </motion.div>
  );
}
