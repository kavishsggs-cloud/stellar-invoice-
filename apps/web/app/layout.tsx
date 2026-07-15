import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { StellarProvider } from "../providers/StellarProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Stellar Invoice",
  description: "Borderless invoicing powered by Stellar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <StellarProvider>
          {children}
          <Toaster theme="dark" position="bottom-right" />
        </StellarProvider>
      </body>
    </html>
  );
}
