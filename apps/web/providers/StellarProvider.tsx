"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  StellarWalletsKit,
  Networks,
} from "@creit.tech/stellar-wallets-kit";
import { FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";

// Note: In a real app we can add albedo(), xbull() explicitly to modules.
// defaultModules() enables all standard wallets.
let kit: StellarWalletsKit | null = null;

export const getKit = () => {
  if (typeof window === "undefined") return null;
  if (!kit) {
    kit = new StellarWalletsKit({
      network: Networks.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: defaultModules(),
    });
  }
  return kit;
};

interface StellarContextType {
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
}

const StellarContext = createContext<StellarContextType>({
  address: null,
  isConnecting: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
  signTransaction: async () => "",
});

export const StellarProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedAddress = localStorage.getItem("stellar_address");
    const storedWalletId = localStorage.getItem("stellar_wallet_id");
    
    if (storedAddress && storedWalletId) {
      getKit()?.setWallet(storedWalletId);
      setAddress(storedAddress);
    }
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await getKit()?.openModal({
        onWalletSelected: async (option: any) => {
          getKit()?.setWallet(option.id);
          const publicKey = await getKit()?.getPublicKey();
          setAddress(publicKey);
          localStorage.setItem("stellar_address", publicKey);
          localStorage.setItem("stellar_wallet_id", option.id);
        },
      });
    } catch (e: any) {
      console.error("Wallet connection failed:", e);
      setError(e.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem("stellar_address");
    localStorage.removeItem("stellar_wallet_id");
  };

  const signTransaction = async (xdr: string): Promise<string> => {
    if (!address) throw new Error("Wallet not connected");
    const res = await getKit()?.signTransaction(xdr);
    if (!res) throw new Error("Failed to sign transaction");
    return res.signedTxXdr;
  };

  return (
    <StellarContext.Provider value={{ address, isConnecting, error, connect, disconnect, signTransaction }}>
      {children}
    </StellarContext.Provider>
  );
};

export const useStellar = () => useContext(StellarContext);
