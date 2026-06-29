import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orkestr — AI Campaign Generator",
  description:
    "Generate fact-checked, multi-format marketing campaigns with AI agents that collaborate in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        <AuthProvider>
          <TooltipProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  boxShadow:
                    "0 4px 12px oklch(0 0 0 / 10%), 0 1px 3px oklch(0 0 0 / 6%)",
                },
              }}
            />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
