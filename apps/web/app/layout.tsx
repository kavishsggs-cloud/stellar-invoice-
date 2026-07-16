import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { StellarProvider } from "../providers/StellarProvider";
import { Toaster } from "sonner";
import { ErrorBoundary } from "../components/error-boundary";
import { FeedbackWidget } from "../components/feedback";
import { Onboarding } from "../components/onboarding";

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
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className} suppressHydrationWarning>
        <ErrorBoundary>
          <StellarProvider>
            {children}
            <FeedbackWidget />
            <Onboarding />
            <Toaster theme="dark" position="bottom-right" />
          </StellarProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
