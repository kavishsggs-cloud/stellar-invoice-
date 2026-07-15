import { describe, it, expect } from 'vitest';
import { isValidAddress } from '../src/wallet';

import { Keypair, StrKey } from '@stellar/stellar-sdk';

describe('isValidAddress', () => {
  it('should return true for a valid Stellar public key', () => {
    const key = Keypair.random().publicKey();
    expect(isValidAddress(key)).toBe(true);
  });

  it('should return false for an invalid address', () => {
    expect(isValidAddress('invalid-address')).toBe(false);
  });

  it('should return true for a valid contract address', () => {
    // Generate a valid 56-char C... address using StrKey
    // A contract ID is a 32-byte array encoded as a C... strkey
    const contractId = StrKey.encodeContract(Buffer.alloc(32));
    expect(isValidAddress(contractId)).toBe(true);
  });
});
