import { useStellar } from "../providers/StellarProvider";

export const useWallet = () => {
  return useStellar();
};
