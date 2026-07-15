"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../../../hooks/useWallet";
import { isValidAddress } from "@repo/sdk";
import { ArrowLeft, CheckCircle2, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateInvoice() {
  const { address } = useWallet();
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
      } catch (e) {
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
      // Mock contract call -> Update local storage for MVP
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      const newInvoice = {
        id: Date.now().toString(),
        creator: address,
        ...formData,
        amount: BigInt(Math.floor(Number(formData.amount) * 10000000)).toString(),
        dueDate: new Date(formData.dueDate).getTime().toString(),
        status: 0, // Pending
        txHash: "",
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
      };

      const key = `invoices_${address}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(newInvoice);
      localStorage.setItem(key, JSON.stringify(existing));
      
      localStorage.removeItem("invoice_draft");
      
      toast.success("Invoice created successfully!");
      setSuccess(true);
      
      setTimeout(() => {
        router.push("/invoices");
      }, 2000);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to create invoice");
      setErrors({ submit: e.message || "Failed to create invoice" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="text-green-500" size={40} />
        </div>
        <h1 className="text-3xl font-bold">Invoice Created!</h1>
        <p className="text-zinc-400">Your invoice has been successfully recorded.</p>
        <p className="text-sm text-zinc-500 flex items-center justify-center">
          <Loader2 className="animate-spin mr-2" size={16} /> Redirecting to invoices...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/invoices" className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
        </div>
        <button 
          type="button" 
          onClick={saveDraft}
          className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <Save size={16} />
          <span>Save Draft</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 space-y-8 shadow-xl">
        {errors.submit && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">
            {errors.submit}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-zinc-800 pb-2 text-blue-400">Client Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Client Name *</label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                className={`w-full bg-zinc-950 border ${errors.clientName ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                placeholder="Acme Corp"
              />
              {errors.clientName && <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1">{errors.clientName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Client Email (Optional)</label>
              <input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                className={`w-full bg-zinc-950 border ${errors.clientEmail ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                placeholder="billing@acme.com"
              />
              {errors.clientEmail && <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1">{errors.clientEmail}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Client Wallet Address *</label>
              <input
                type="text"
                name="recipient"
                value={formData.recipient}
                onChange={handleChange}
                className={`w-full bg-zinc-950 border ${errors.recipient ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2 font-mono text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                placeholder="G..."
              />
              {errors.recipient && <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1">{errors.recipient}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-zinc-800 pb-2 text-blue-400">Invoice Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Description *</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full bg-zinc-950 border ${errors.description ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
              placeholder="Web Design Services - Phase 1"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Amount *</label>
              <div className="relative">
                <input
                  type="number"
                  name="amount"
                  step="0.0000001"
                  value={formData.amount}
                  onChange={handleChange}
                  className={`w-full bg-zinc-950 border ${errors.amount ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                  placeholder="100.00"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-zinc-500 font-medium">{formData.asset === 'native' ? 'XLM' : 'USDC'}</span>
                </div>
              </div>
              {errors.amount && <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Asset *</label>
              <select
                name="asset"
                value={formData.asset}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              >
                <option value="native">XLM (Native)</option>
                <option value="usdc">USDC</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className={`w-full bg-zinc-950 border ${errors.dueDate ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all [color-scheme:dark]`}
              />
              {errors.dueDate && <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1">{errors.dueDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Stellar Memo (Optional)</label>
              <input
                type="text"
                name="memo"
                value={formData.memo}
                onChange={handleChange}
                className={`w-full bg-zinc-950 border ${errors.memo ? 'border-red-500' : 'border-zinc-800'} rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                placeholder="Max 28 chars"
                maxLength={28}
              />
              {errors.memo && <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1">{errors.memo}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
              placeholder="Thank you for your business!"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-4 py-4 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <span>Create Invoice</span>}
          </button>
        </div>
      </form>
    </div>
  );
}
