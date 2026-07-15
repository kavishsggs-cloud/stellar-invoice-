"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  StellarWalletsKit,
  Networks,
} from "@creit.tech/stellar-wallets-kit";
import { FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";

// Default modules enables all standard wallets.
export interface StellarContextType {
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
    // Initialize the kit once on mount
    StellarWalletsKit.init({
      network: Networks.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: defaultModules(),
    });

    const checkExistingSession = async () => {
      try {
        const storedAddress = localStorage.getItem("stellar_address");
        const storedWalletId = localStorage.getItem("stellar_wallet_id");
        
        if (storedAddress && storedWalletId) {
          StellarWalletsKit.setWallet(storedWalletId);
          setAddress(storedAddress);
        }
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    };

    checkExistingSession();
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const { address } = await StellarWalletsKit.authModal();
      setAddress(address);
      localStorage.setItem("stellar_address", address);
    } catch (e: unknown) {
      console.error("Wallet connection failed:", e);
      if (e instanceof Error) {
        setError(e.message || "Failed to connect wallet.");
      } else {
        setError("Failed to connect wallet.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await StellarWalletsKit.disconnect();
    } catch (e) {
      console.error("Error disconnecting wallet", e);
    }
    setAddress(null);
    localStorage.removeItem("stellar_address");
    localStorage.removeItem("stellar_wallet_id");
  };

  const signTransaction = async (xdr: string): Promise<string> => {
    if (!address) throw new Error("Wallet not connected");
    const res = await StellarWalletsKit.signTransaction(xdr);
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
