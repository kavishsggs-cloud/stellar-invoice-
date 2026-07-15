"use client";

import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useWallet } from "../../hooks/useWallet";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { address, isConnecting } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!address && !isConnecting) {
      // If no wallet connected, redirect to landing page
      router.push("/");
    }
  }, [address, isConnecting, router]);

  if (isConnecting || !address) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
