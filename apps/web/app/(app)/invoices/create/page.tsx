"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../../hooks/useWallet";
import {
  isValidAddress,
  InvoiceContractAPI,
  CONTRACT_ID,
  buildContractTransaction,
  submitTransaction,
} from "@repo/sdk";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Save,
  Users,
  FileSpreadsheet,
  Send,
  Calendar,
  HelpCircle,
  Hexagon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../components/ui/button";

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
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
    Object.keys(formData).forEach((key) => {
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
      const callData = api.getCallData(
        "create_invoice",
        api.createInvoiceArgs({
          creator: address,
          clientName: formData.clientName,
          recipient: formData.recipient,
          clientEmail: formData.clientEmail,
          description: formData.description,
          amount: BigInt(Math.floor(Number(formData.amount) * 10000000)),
          asset:
            formData.asset === "native"
              ? "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
              : formData.asset,
          memo: formData.memo,
          notes: formData.notes,
          dueDate: BigInt(new Date(formData.dueDate).getTime()),
        }),
      );

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
      if (e instanceof Error) {
        if (
          e.message.includes("User rejected") ||
          e.message.includes("rejected")
        ) {
          toast.warning("Transaction was cancelled in wallet");
          setErrors({ submit: "Transaction signature cancelled" });
        } else {
          console.error("Create invoice error:", e);
          toast.error(e.message || "Failed to create invoice");
          setErrors({ submit: e.message || "Failed to create invoice" });
        }
      } else {
        console.error("Create invoice error:", e);
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
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-6 text-[#bbc7c6]">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-24 h-24 bg-[#012624] rounded-full flex items-center justify-center mx-auto border border-[#cbfffc]/20"
        >
          <CheckCircle2 className="text-[#cbfffc]" size={48} />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-[36px] font-medium text-[#ffffff]">
            Invoice Created!
          </h1>
          <p className="text-[#bbc7c6] mt-2 mb-6">
            Your invoice has been successfully recorded on the Stellar network.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-[#edfffe] bg-[#003734] py-3 rounded-[6px] border border-[#cbfffc]/10">
            <Loader2 className="animate-spin text-[#cbfffc]" size={16} />
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
      className="space-y-8 text-[#bbc7c6]"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Link href="/invoices">
            <Button className="w-10 h-10 p-0 rounded-[6px] bg-[#003734] hover:bg-[#003734]/80 text-[#ffffff] border border-[#cbfffc]/15 shadow-none flex items-center justify-center">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-[36px] font-medium tracking-[-0.03em] text-[#ffffff]">
              Create Invoice
            </h1>
            <p className="text-[#bbc7c6] mt-1 text-base">
              Issue a new blockchain billing record
            </p>
          </div>
        </div>
        <Button
          onClick={saveDraft}
          className="bg-[#012624] text-[#edfffe] font-medium text-[13px] uppercase tracking-[0.05em] rounded-[6px] px-5 py-2.5 hover:bg-[#012624]/80 border border-[#cbfffc]/15 shadow-none"
        >
          <Save size={16} className="mr-2 inline" />
          <span>Save Draft</span>
        </Button>
      </motion.div>

      {/* Progressive Step Progress Indicator */}
      <motion.div variants={itemVariants} className="max-w-xl">
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.12em] text-[#bbc7c6] mb-3">
          <span
            className={
              activeStep === "client" ? "text-[#cbfffc] font-medium" : ""
            }
          >
            1. Client Info
          </span>
          <span
            className={
              activeStep === "details" ? "text-[#cbfffc] font-medium" : ""
            }
          >
            2. Invoice Info
          </span>
          <span
            className={
              activeStep === "review" ? "text-[#cbfffc] font-medium" : ""
            }
          >
            3. Settle terms
          </span>
        </div>
        <div className="h-1.5 bg-[#011d1c] rounded-[3px] overflow-hidden">
          <motion.div
            animate={{
              width:
                activeStep === "client"
                  ? "33%"
                  : activeStep === "details"
                    ? "66%"
                    : "100%",
            }}
            transition={{ duration: 0.3 }}
            className="h-full bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)]"
          />
        </div>
      </motion.div>

      {/* Grid split view: form on the left, live invoice preview card mockup on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Active Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit}>
            <div className="bg-[#003734] rounded-[16px] p-8 border border-[#cbfffc]/10 shadow-none space-y-8">
              {errors.submit && (
                <div className="bg-[#011d1c] border border-red-500/30 text-red-400 p-4 rounded-[6px] text-sm flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-400 mr-3 animate-pulse"></div>
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
                    <div className="flex items-center space-x-3 border-b border-[#cbfffc]/10 pb-3">
                      <Users className="text-[#cbfffc]" size={20} />
                      <h2 className="text-[24px] font-medium text-[#ffffff]">
                        Client Details
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium uppercase tracking-[0.1em] text-[#edfffe]">
                          Client Name *
                        </label>
                        <input
                          type="text"
                          name="clientName"
                          value={formData.clientName}
                          onChange={handleChange}
                          placeholder="Acme Corp"
                          className="flex h-11 w-full rounded-[6px] border border-[#cbfffc]/15 bg-[#012624] px-4 text-sm text-[#ffffff] placeholder:text-[#707777] focus:outline-none focus:border-[#cbfffc] transition-all"
                        />
                        {errors.clientName && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.clientName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium uppercase tracking-[0.1em] text-[#edfffe]">
                          Client Email{" "}
                          <span className="text-[#bbc7c6]/60">(Optional)</span>
                        </label>
                        <input
                          type="email"
                          name="clientEmail"
                          value={formData.clientEmail}
                          onChange={handleChange}
                          placeholder="billing@acme.com"
                          className="flex h-11 w-full rounded-[6px] border border-[#cbfffc]/15 bg-[#012624] px-4 text-sm text-[#ffffff] placeholder:text-[#707777] focus:outline-none focus:border-[#cbfffc] transition-all"
                        />
                        {errors.clientEmail && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.clientEmail}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium uppercase tracking-[0.1em] text-[#edfffe]">
                          Client Stellar Address *
                        </label>
                        <input
                          type="text"
                          name="recipient"
                          value={formData.recipient}
                          onChange={handleChange}
                          placeholder="G..."
                          className="flex h-11 w-full rounded-[6px] border border-[#cbfffc]/15 bg-[#012624] px-4 text-sm text-[#ffffff] placeholder:text-[#707777] focus:outline-none focus:border-[#cbfffc] transition-all font-mono"
                        />
                        {errors.recipient && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.recipient}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button
                        type="button"
                        onClick={() => handleNextStep("details")}
                        className="bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] text-[#011d1c] font-medium text-[13px] uppercase tracking-[0.05em] rounded-[6px] px-6 py-2.5 hover:opacity-90 shadow-none border-0"
                      >
                        Next Step
                        <ArrowRight size={16} className="ml-2 inline" />
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
                    <div className="flex items-center space-x-3 border-b border-[#cbfffc]/10 pb-3">
                      <FileSpreadsheet className="text-[#cbfffc]" size={20} />
                      <h2 className="text-[24px] font-medium text-[#ffffff]">
                        Invoice details
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium uppercase tracking-[0.1em] text-[#edfffe]">
                          Description *
                        </label>
                        <input
                          type="text"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Design Services - Phase 1"
                          className="flex h-11 w-full rounded-[6px] border border-[#cbfffc]/15 bg-[#012624] px-4 text-sm text-[#ffffff] placeholder:text-[#707777] focus:outline-none focus:border-[#cbfffc] transition-all"
                        />
                        {errors.description && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors.description}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-medium uppercase tracking-[0.1em] text-[#edfffe]">
                            Amount *
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="amount"
                              step="0.0000001"
                              value={formData.amount}
                              onChange={handleChange}
                              placeholder="100.00"
                              className="flex h-11 w-full rounded-[6px] border border-[#cbfffc]/15 bg-[#012624] px-4 text-sm text-[#ffffff] placeholder:text-[#707777] focus:outline-none focus:border-[#cbfffc] transition-all"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                              <span className="text-[#bbc7c6] font-medium text-xs">
                                {formData.asset === "native" ? "XLM" : "USDC"}
                              </span>
                            </div>
                          </div>
                          {errors.amount && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors.amount}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-medium uppercase tracking-[0.1em] text-[#edfffe]">
                            Asset *
                          </label>
                          <select
                            name="asset"
                            value={formData.asset}
                            onChange={handleChange}
                            className="flex h-11 w-full rounded-[6px] border border-[#cbfffc]/15 bg-[#012624] px-4 text-sm text-[#ffffff] focus:outline-none focus:border-[#cbfffc] transition-all cursor-pointer"
                          >
                            <option value="native" className="bg-[#012624]">
                              XLM (Native)
                            </option>
                            <option value="usdc" className="bg-[#012624]">
                              USDC
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-medium uppercase tracking-[0.1em] text-[#edfffe]">
                            Due Date *
                          </label>
                          <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className="flex h-11 w-full rounded-[6px] border border-[#cbfffc]/15 bg-[#012624] px-4 text-sm text-[#ffffff] focus:outline-none focus:border-[#cbfffc] transition-all [color-scheme:dark]"
                          />
                          {errors.dueDate && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors.dueDate}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-1.5">
                            <label className="block text-xs font-medium uppercase tracking-[0.1em] text-[#edfffe]">
                              Stellar Memo
                            </label>
                            <HelpCircle
                              size={14}
                              className="text-[#bbc7c6] cursor-help"
                            />
                          </div>
                          <input
                            type="text"
                            name="memo"
                            value={formData.memo}
                            onChange={handleChange}
                            placeholder="Max 28 chars"
                            maxLength={28}
                            className="flex h-11 w-full rounded-[6px] border border-[#cbfffc]/15 bg-[#012624] px-4 text-sm text-[#ffffff] placeholder:text-[#707777] focus:outline-none focus:border-[#cbfffc] transition-all"
                          />
                          {errors.memo && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors.memo}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium uppercase tracking-[0.1em] text-[#edfffe]">
                          Notes{" "}
                          <span className="text-[#bbc7c6]/60">(Optional)</span>
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows={3}
                          className="flex w-full rounded-[6px] border border-[#cbfffc]/15 bg-[#012624] px-4 py-3 text-sm text-[#ffffff] placeholder:text-[#707777] focus:outline-none focus:border-[#cbfffc] transition-all resize-none"
                          placeholder="Thank you for your business!"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button
                        type="button"
                        onClick={() => setActiveStep("client")}
                        className="bg-[#012624] text-[#ffffff] font-medium text-[13px] uppercase tracking-[0.05em] rounded-[6px] px-6 py-2.5 hover:bg-[#012624]/80 border border-[#cbfffc]/15 shadow-none"
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleNextStep("review")}
                        className="bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] text-[#011d1c] font-medium text-[13px] uppercase tracking-[0.05em] rounded-[6px] px-6 py-2.5 hover:opacity-90 shadow-none border-0"
                      >
                        Next Step
                        <ArrowRight size={16} className="ml-2 inline" />
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
                    <div className="flex items-center space-x-3 border-b border-[#cbfffc]/10 pb-3">
                      <Send className="text-[#cbfffc]" size={20} />
                      <h2 className="text-[24px] font-medium text-[#ffffff]">
                        Review & Submit
                      </h2>
                    </div>

                    <div className="space-y-4 bg-[#012624] p-5 rounded-[12px] border border-[#cbfffc]/10">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[#bbc7c6] text-xs">Client Name</p>
                          <p className="text-[#ffffff] font-medium mt-1">
                            {formData.clientName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#bbc7c6] text-xs">
                            Client Address
                          </p>
                          <p className="text-[#ffffff] font-mono mt-1 truncate">
                            {formData.recipient}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#bbc7c6] text-xs">Total Amount</p>
                          <p className="text-[#fde9ff] font-medium text-lg font-['Matter',sans-serif] mt-1">
                            {formData.amount}{" "}
                            {formData.asset === "native" ? "XLM" : "USDC"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#bbc7c6] text-xs">Due Date</p>
                          <p className="text-[#ffffff] font-medium mt-1">
                            {formData.dueDate}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <Button
                        type="button"
                        onClick={() => setActiveStep("details")}
                        className="bg-[#012624] text-[#ffffff] font-medium text-[13px] uppercase tracking-[0.05em] rounded-[6px] px-6 py-2.5 hover:bg-[#012624]/80 border border-[#cbfffc]/15 shadow-none"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[linear-gradient(90deg,#cbfffc_0%,#edfffe_26.25%,#fffdfa_47.57%,#fad1ff_88.96%)] text-[#011d1c] font-medium text-[14px] uppercase tracking-[0.05em] rounded-[6px] px-8 py-3.5 hover:opacity-90 shadow-none border-0"
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
            </div>
          </form>
        </div>

        {/* Live Card Mockup Preview Column */}
        <div className="lg:col-span-5 sticky top-8">
          <div className="text-xs font-medium uppercase tracking-[0.12em] text-[#edfffe] mb-3 flex items-center justify-between">
            <span>Live Interactive Preview</span>
            <span className="flex items-center text-[#cbfffc]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cbfffc] animate-ping mr-2" />
              Sync active
            </span>
          </div>

          <div className="bg-[#003734] rounded-[16px] border border-[#cbfffc]/15 shadow-none overflow-hidden">
            <div className="px-6 py-4 bg-[#012624] border-b border-[#cbfffc]/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Hexagon size={18} className="text-[#cbfffc]" />
                <span className="text-xs font-medium text-[#ffffff] tracking-wider uppercase">
                  Stellar Receipt
                </span>
              </div>
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-[4px] border bg-[#003734] text-[#edfffe] border-[#edfffe]/30">
                Draft
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-[#edfffe] text-[10px] uppercase tracking-[0.1em] font-medium">
                  Amount Due
                </p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="text-4xl font-medium text-[#fde9ff] font-['Matter',sans-serif]">
                    {formData.amount || "0.00"}
                  </span>
                  <span className="text-lg text-[#cbfffc] font-medium">
                    {formData.asset === "native" ? "XLM" : "USDC"}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="pb-4 border-b border-[#cbfffc]/10">
                  <p className="text-[#edfffe] uppercase tracking-[0.1em] mb-1 font-medium text-[10px]">
                    Bill To Client
                  </p>
                  <p className="text-[#ffffff] font-medium text-sm truncate">
                    {formData.clientName || "Acme Client Corp"}
                  </p>
                  {formData.recipient && (
                    <p className="text-[#bbc7c6] font-mono mt-0.5 truncate">
                      {formData.recipient}
                    </p>
                  )}
                </div>

                <div className="pb-4 border-b border-[#cbfffc]/10">
                  <p className="text-[#edfffe] uppercase tracking-[0.1em] mb-1 font-medium text-[10px]">
                    Description
                  </p>
                  <p className="text-[#ffffff] font-normal">
                    {formData.description ||
                      "Web billing contract development..."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#edfffe] uppercase tracking-[0.1em] mb-1 font-medium text-[10px]">
                      Due Date
                    </p>
                    <div className="flex items-center text-[#ffffff]">
                      <Calendar size={12} className="mr-1.5 text-[#bbc7c6]" />
                      <span>{formData.dueDate || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[#edfffe] uppercase tracking-[0.1em] mb-1 font-medium text-[10px]">
                      Memo
                    </p>
                    <p className="text-[#ffffff] font-mono truncate">
                      {formData.memo || "None"}
                    </p>
                  </div>
                </div>

                {formData.notes && (
                  <div>
                    <p className="text-[#edfffe] uppercase tracking-[0.1em] mb-1 font-medium text-[10px]">
                      Notes
                    </p>
                    <p className="text-[#bbc7c6] italic">
                      &quot;{formData.notes}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
