"use client";

import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useWallet } from "../../hooks/useWallet";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { address, isConnecting, isInitializing } = useWallet();
  const router = useRouter();
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const [storedAddr, setStoredAddr] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("stellar_address");
      const urlParams = new URLSearchParams(window.location.search);
      const urlAddr = urlParams.get("address") || urlParams.get("account");
      setStoredAddr(local || urlAddr || null);
    }
    setHasCheckedStorage(true);
  }, []);

  useEffect(() => {
    if (!hasCheckedStorage || isInitializing || isConnecting) {
      return;
    }
    if (!address && !storedAddr) {
      router.push("/");
    }
  }, [address, isConnecting, isInitializing, hasCheckedStorage, storedAddr, router]);

  if (!hasCheckedStorage || isInitializing || isConnecting || (!address && storedAddr)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#012624] text-[#cbfffc]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-[#cbfffc]" size={40} />
          <p className="text-[#bbc7c6] text-xs font-medium uppercase tracking-[0.1em]">
            Restoring On-Chain Node Session...
          </p>
        </div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

