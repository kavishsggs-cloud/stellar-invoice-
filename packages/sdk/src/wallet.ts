import { StrKey, Networks, rpc } from '@stellar/stellar-sdk';
export function isValidAddress(address: string): boolean {
  try {
    return StrKey.isValidEd25519PublicKey(address) || StrKey.isValidContract(address);
  } catch {
    return false;
  }
}

export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const RPC_URL = 'https://soroban-testnet.stellar.org:443';

export const server = new rpc.Server(RPC_URL);

export async function submitTransaction(txXdr: string) {
  // In a real implementation we would submit the signed transaction to the Soroban RPC server
  // and wait for completion. For MVP, we mock it after 2 seconds.
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { hash: "mock_tx_hash_" + Date.now(), status: "SUCCESS" };
}
