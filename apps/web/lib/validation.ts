import { isValidAddress } from "@repo/sdk";

export interface InvoiceFormData {
  clientName: string;
  recipient: string;
  clientEmail?: string;
  description: string;
  amount: string;
  asset: string;
  memo?: string;
  notes?: string;
  dueDate: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateInvoiceForm(data: InvoiceFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.clientName || data.clientName.trim().length === 0) {
    errors.clientName = "Client name is required.";
  }

  if (!data.recipient || !isValidAddress(data.recipient)) {
    errors.recipient = "Valid Stellar public key (G...) or contract address (C...) is required.";
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.description = "Invoice description is required.";
  }

  const numAmount = parseFloat(data.amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.amount = "Invoice amount must be a positive number.";
  }

  if (!data.dueDate) {
    errors.dueDate = "Due date is required.";
  } else {
    const dueTime = new Date(data.dueDate).getTime();
    if (isNaN(dueTime) || dueTime < Date.now() - 86400000) {
      errors.dueDate = "Due date cannot be in the past.";
    }
  }

  if (data.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.clientEmail)) {
    errors.clientEmail = "Invalid email format.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
