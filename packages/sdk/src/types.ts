export enum InvoiceStatus {
  Pending = 0,
  Paid = 1,
  Cancelled = 2,
}

export interface Invoice {
  id: bigint;
  creator: string;
  clientName: string;
  recipient: string;
  clientEmail: string;
  description: string;
  amount: bigint;
  asset: string;
  memo: string;
  notes: string;
  dueDate: bigint;
  status: InvoiceStatus;
  txHash: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface CreateInvoiceArgs {
  creator: string;
  clientName: string;
  recipient: string;
  clientEmail: string;
  description: string;
  amount: bigint;
  asset: string;
  memo: string;
  notes: string;
  dueDate: bigint;
}

export interface UpdateInvoiceArgs {
  id: bigint;
  clientName: string;
  recipient: string;
  clientEmail: string;
  description: string;
  amount: bigint;
  asset: string;
  memo: string;
  notes: string;
  dueDate: bigint;
}
