"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../../hooks/useWallet";
import { isValidAddress, InvoiceContractAPI, CONTRACT_ID, buildContractTransaction, submitTransaction } from "@repo/sdk";
import { ArrowLeft, CheckCircle2, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";

export default function CreateInvoice() {
  const { address, signTransaction } = useWallet();
  const router = useRouter();
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
    hidden: { opacity: 0, y: 20 },
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
      className="max-w-3xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/invoices">
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Create Invoice</h1>
            <p className="text-text-secondary mt-1">Issue a new blockchain invoice</p>
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

      <motion.div variants={itemVariants}>
        <form onSubmit={handleSubmit}>
          <Card variant="glass" padding="lg" className="space-y-8">
            {errors.submit && (
              <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl text-sm flex items-center">
                <div className="w-2 h-2 rounded-full bg-danger mr-3 animate-pulse"></div>
                {errors.submit}
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h2 className="text-lg font-semibold text-stellar-blue">Client Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="md:col-span-2 space-y-2">
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
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h2 className="text-lg font-semibold text-stellar-blue">Invoice Details</h2>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">Description *</label>
                <Input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  placeholder="Web Design Services - Phase 1"
                />
                {errors.description && <p className="text-danger text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label className="block text-sm font-medium text-text-secondary">Stellar Memo <span className="text-text-muted">(Optional)</span></label>
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

            <div className="pt-6 mt-6 border-t border-white/5">
              <Button
                type="submit"
                size="lg"
                className="w-full text-base font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Processing on Network...
                  </span>
                ) : (
                  "Create & Issue Invoice"
                )}
              </Button>
            </div>
          </Card>
        </form>
      </motion.div>
    </motion.div>
  );
}
