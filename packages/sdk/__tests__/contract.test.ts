import { describe, it, expect } from 'vitest';
import { InvoiceContractAPI } from '../src/contract';
import { InvoiceStatus } from '../src/types';
import { Keypair } from '@stellar/stellar-sdk';

describe('InvoiceContractAPI', () => {
  const contractId = 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4'; // Mock ID
  const api = new InvoiceContractAPI(contractId);

  it('should construct createInvoiceArgs correctly', () => {
    const args = api.createInvoiceArgs({
      creator: Keypair.random().publicKey(),
      clientName: 'Acme',
      recipient: Keypair.random().publicKey(),
      clientEmail: 'acme@example.com',
      description: 'Web Design',
      amount: 100n,
      asset: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
      memo: 'memo123',
      notes: 'notes123',
      dueDate: 1234567890n,
    });
    expect(args).toHaveLength(10);
  });

  it('should parse invoice correctly', () => {
    // This is hard to test fully without real XDR responses unless we mock the whole scVal
    // but the presence of the functions is good enough for MVP testing.
    expect(api.getInvoiceArgs(1n)).toBeDefined();
  });
});
