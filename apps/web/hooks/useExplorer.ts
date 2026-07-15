export const useExplorer = () => {
  const getTransactionUrl = (txHash: string, network: "public" | "testnet" | "futurenet" = "testnet") => {
    return `https://stellar.expert/explorer/${network}/tx/${txHash}`;
  };

  const getAccountUrl = (accountId: string, network: "public" | "testnet" | "futurenet" = "testnet") => {
    return `https://stellar.expert/explorer/${network}/account/${accountId}`;
  };

  const getContractUrl = (contractId: string, network: "public" | "testnet" | "futurenet" = "testnet") => {
    return `https://stellar.expert/explorer/${network}/contract/${contractId}`;
  };

  return {
    getTransactionUrl,
    getAccountUrl,
    getContractUrl,
  };
};
