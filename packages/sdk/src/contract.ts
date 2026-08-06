import {
  Contract,
  xdr,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";
import {
  CreateInvoiceArgs,
  UpdateInvoiceArgs,
  Invoice,
  InvoiceStatus,
} from "./types.js";

export class InvoiceContractAPI {
  private contract: Contract;

  constructor(contractId: string) {
    this.contract = new Contract(contractId);
  }

  public createInvoiceArgs(args: CreateInvoiceArgs): xdr.ScVal[] {
    return [
      nativeToScVal(args.creator, { type: "address" }),
      nativeToScVal(args.clientName, { type: "string" }),
      nativeToScVal(args.recipient, { type: "address" }),
      nativeToScVal(args.clientEmail, { type: "string" }),
      nativeToScVal(args.description, { type: "string" }),
      nativeToScVal(args.amount, { type: "i128" }),
      nativeToScVal(args.asset, { type: "address" }),
      nativeToScVal(args.memo, { type: "string" }),
      nativeToScVal(args.notes, { type: "string" }),
      nativeToScVal(args.dueDate, { type: "u64" }),
    ];
  }

  public updateInvoiceArgs(args: UpdateInvoiceArgs): xdr.ScVal[] {
    return [
      nativeToScVal(args.id, { type: "u64" }),
      nativeToScVal(args.clientName, { type: "string" }),
      nativeToScVal(args.recipient, { type: "address" }),
      nativeToScVal(args.clientEmail, { type: "string" }),
      nativeToScVal(args.description, { type: "string" }),
      nativeToScVal(args.amount, { type: "i128" }),
      nativeToScVal(args.asset, { type: "address" }),
      nativeToScVal(args.memo, { type: "string" }),
      nativeToScVal(args.notes, { type: "string" }),
      nativeToScVal(args.dueDate, { type: "u64" }),
    ];
  }

  public getInvoiceArgs(id: bigint): xdr.ScVal[] {
    return [nativeToScVal(id, { type: "u64" })];
  }

  public listInvoicesArgs(creator: string): xdr.ScVal[] {
    return [nativeToScVal(creator, { type: "address" })];
  }

  public markPaidArgs(id: bigint, txHash: string): xdr.ScVal[] {
    return [
      nativeToScVal(id, { type: "u64" }),
      nativeToScVal(txHash, { type: "string" }),
    ];
  }

  public cancelInvoiceArgs(id: bigint): xdr.ScVal[] {
    return [nativeToScVal(id, { type: "u64" })];
  }

  public parseInvoice(val: xdr.ScVal): Invoice {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = scValToNative(val) as Record<string, any>;
    return {
      id: BigInt(raw.id),
      creator: raw.creator,
      clientName: raw.client_name,
      recipient: raw.recipient,
      clientEmail: raw.client_email,
      description: raw.description,
      amount: BigInt(raw.amount),
      asset: raw.asset,
      memo: raw.memo,
      notes: raw.notes,
      dueDate: BigInt(raw.due_date),
      status: this.parseStatus(raw.status),
      txHash: raw.tx_hash,
      createdAt: BigInt(raw.created_at),
      updatedAt: BigInt(raw.updated_at),
    };
  }

  public parseInvoiceList(val: xdr.ScVal): Invoice[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawList = scValToNative(val) as Record<string, any>[];
    return rawList.map((raw) => ({
      id: BigInt(raw.id),
      creator: raw.creator,
      clientName: raw.client_name,
      recipient: raw.recipient,
      clientEmail: raw.client_email,
      description: raw.description,
      amount: BigInt(raw.amount),
      asset: raw.asset,
      memo: raw.memo,
      notes: raw.notes,
      dueDate: BigInt(raw.due_date),
      status: this.parseStatus(raw.status),
      txHash: raw.tx_hash,
      createdAt: BigInt(raw.created_at),
      updatedAt: BigInt(raw.updated_at),
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public parseStatus(statusVal: any): InvoiceStatus {
    if (statusVal === null || statusVal === undefined) return InvoiceStatus.Pending;

    if (typeof statusVal === "number") {
      if (statusVal === 1) return InvoiceStatus.Paid;
      if (statusVal === 2) return InvoiceStatus.Cancelled;
      if (statusVal === 0) return InvoiceStatus.Pending;
    }

    if (typeof statusVal === "string") {
      const lower = statusVal.toLowerCase();
      if (lower === "paid") return InvoiceStatus.Paid;
      if (lower === "cancelled" || lower === "canceled") return InvoiceStatus.Cancelled;
      if (lower === "pending") return InvoiceStatus.Pending;
    }

    if (typeof statusVal === "object") {
      const tag = statusVal.tag || statusVal.name || Object.keys(statusVal)[0];
      if (typeof tag === "string") {
        const lower = tag.toLowerCase();
        if (lower === "paid") return InvoiceStatus.Paid;
        if (lower === "cancelled" || lower === "canceled") return InvoiceStatus.Cancelled;
        if (lower === "pending") return InvoiceStatus.Pending;
      }
    }

    return InvoiceStatus.Pending;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getCallData(method: string, args: xdr.ScVal[]): any {
    return this.contract.call(method, ...args);
  }
}
