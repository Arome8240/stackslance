import type { Metadata } from "next";
import "./globals.css";
import WalletConnect from "@/components/WalletConnect";
import Link from "next/link";

export const metadata: Metadata = {
  title: "StacksLance",
  description: "Decentralized freelance marketplace on Stacks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="font-bold text-lg text-orange-500 tracking-tight"
            >
              StacksLance
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/jobs/create"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Post a Job
              </Link>
              <WalletConnect />
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
