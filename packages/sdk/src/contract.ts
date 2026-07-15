import { Contract, xdr, nativeToScVal, scValToNative } from '@stellar/stellar-sdk';
import { CreateInvoiceArgs, UpdateInvoiceArgs, Invoice, InvoiceStatus } from './types.js';

export class InvoiceContractAPI {
  private contract: Contract;

  constructor(contractId: string) {
    this.contract = new Contract(contractId);
  }

  public createInvoiceArgs(args: CreateInvoiceArgs): xdr.ScVal[] {
    return [
      nativeToScVal(args.creator, { type: 'address' }),
      nativeToScVal(args.clientName, { type: 'string' }),
      nativeToScVal(args.recipient, { type: 'address' }),
      nativeToScVal(args.clientEmail, { type: 'string' }),
      nativeToScVal(args.description, { type: 'string' }),
      nativeToScVal(args.amount, { type: 'i128' }),
      nativeToScVal(args.asset, { type: 'address' }),
      nativeToScVal(args.memo, { type: 'string' }),
      nativeToScVal(args.notes, { type: 'string' }),
      nativeToScVal(args.dueDate, { type: 'u64' }),
    ];
  }

  public updateInvoiceArgs(args: UpdateInvoiceArgs): xdr.ScVal[] {
    return [
      nativeToScVal(args.id, { type: 'u64' }),
      nativeToScVal(args.clientName, { type: 'string' }),
      nativeToScVal(args.recipient, { type: 'address' }),
      nativeToScVal(args.clientEmail, { type: 'string' }),
      nativeToScVal(args.description, { type: 'string' }),
      nativeToScVal(args.amount, { type: 'i128' }),
      nativeToScVal(args.asset, { type: 'address' }),
      nativeToScVal(args.memo, { type: 'string' }),
      nativeToScVal(args.notes, { type: 'string' }),
      nativeToScVal(args.dueDate, { type: 'u64' }),
    ];
  }

  public getInvoiceArgs(id: bigint): xdr.ScVal[] {
    return [nativeToScVal(id, { type: 'u64' })];
  }

  public listInvoicesArgs(creator: string): xdr.ScVal[] {
    return [nativeToScVal(creator, { type: 'address' })];
  }

  public markPaidArgs(id: bigint, txHash: string): xdr.ScVal[] {
    return [
      nativeToScVal(id, { type: 'u64' }),
      nativeToScVal(txHash, { type: 'string' }),
    ];
  }

  public cancelInvoiceArgs(id: bigint): xdr.ScVal[] {
    return [nativeToScVal(id, { type: 'u64' })];
  }

  public parseInvoice(val: xdr.ScVal): Invoice {
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
    const rawList = scValToNative(val) as Record<string, any>[];
    return rawList.map(raw => ({
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

  private parseStatus(statusVal: any): InvoiceStatus {
    if (typeof statusVal === 'string') {
      if (statusVal === 'Pending') return InvoiceStatus.Pending;
      if (statusVal === 'Paid') return InvoiceStatus.Paid;
      if (statusVal === 'Cancelled') return InvoiceStatus.Cancelled;
    }
    return InvoiceStatus.Pending;
  }

  public getCallData(method: string, args: xdr.ScVal[]): any {
    return this.contract.call(method, ...args);
  }
}
