import { StrKey, Networks, rpc, TransactionBuilder, Account, xdr, Transaction } from '@stellar/stellar-sdk';

export function isValidAddress(address: string): boolean {
  try {
    return StrKey.isValidEd25519PublicKey(address) || StrKey.isValidContract(address);
  } catch {
    return false;
  }
}

export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const RPC_URL = 'https://soroban-testnet.stellar.org:443';
export const CONTRACT_ID = "CBPNGAIA64YE7TEQIBWYVQPMOFITNK3LRXZVPATUJA63PR364KNCTVEO";

export const server = new rpc.Server(RPC_URL);

export async function buildContractTransaction(source: string, operation: xdr.Operation) {
  let sourceAccount;
  try {
    sourceAccount = await server.getAccount(source);
  } catch (e) {
    sourceAccount = new Account(source, "1");
  }
  
  const tx = new TransactionBuilder(sourceAccount, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const preparedTx = await server.prepareTransaction(tx);
  return preparedTx.toXDR();
}

export async function simulateContractCall(source: string, operation: xdr.Operation): Promise<xdr.ScVal> {
  let sourceAccount = new Account(source, "1");
  const tx = new TransactionBuilder(sourceAccount, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) {
    throw new Error(simResult.error);
  }
  if (!simResult.result || !simResult.result.retval) {
    throw new Error("No return value in simulation");
  }
  return simResult.result.retval;
}

export async function submitTransaction(txXdr: string) {
  try {
    const tx = TransactionBuilder.fromXDR(txXdr, NETWORK_PASSPHRASE) as Transaction;
    const sendResponse = await server.sendTransaction(tx);
    if (sendResponse.status === "ERROR") {
      throw new Error(`Transaction failed: ${JSON.stringify((sendResponse as any).errorResultXdr || (sendResponse as any).errorResult)}`);
    }
    if (sendResponse.status === "PENDING") {
      let txResponse = await server.getTransaction(sendResponse.hash);
      let attempts = 0;
      while (txResponse.status === "NOT_FOUND" && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        txResponse = await server.getTransaction(sendResponse.hash);
        attempts++;
      }
      if (txResponse.status === "SUCCESS") {
        return { hash: sendResponse.hash, status: "SUCCESS" };
      }
      if (txResponse.status === "FAILED") {
        throw new Error(`Transaction failed on chain: ${txResponse.resultXdr}`);
      }
    }
    return { hash: sendResponse.hash, status: sendResponse.status };
  } catch (e: any) {
    console.error("Submission error:", e);
    throw e;
  }
}
