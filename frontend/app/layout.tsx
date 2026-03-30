import type { Metadata } from "next";
import "./globals.css";
import WalletConnect from "@/components/WalletConnect";
import Link from "next/link";

export const metadata: Metadata = {
  title: "StacksLance — Freelance on Stacks",
  description:
    "Decentralized freelance marketplace powered by Stacks blockchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-[#404145]">
        {/* Top nav */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
            {/* Logo */}
            <Link
              href="/"
              className="text-2xl font-black tracking-tight text-blue-700"
            >
              stacks<span className="text-gray-900">lance</span>
              <span className="text-blue-700">.</span>
            </Link>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-xl">
              <div className="flex w-full border border-gray-900 rounded-xl overflow-hidden">
                <input
                  type="text"
                  placeholder="Search for any service..."
                  className="flex-1 px-4 py-2 text-sm outline-none text-gray-700"
                />
                <button className="bg-gray-900 hover:bg-gray-700 text-white px-4 text-sm font-medium transition-colors">
                  Search
                </button>
              </div>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-5 text-sm text-gray-700">
              <Link
                href="/jobs/create"
                className="hover:text-blue-700 transition-colors font-medium"
              >
                Post a Job
              </Link>
            </nav>

            <WalletConnect />
          </div>
        </header>

        {children}

        {/* Footer */}
        <footer className="border-t border-gray-200 mt-20 py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-400">
            <p className="font-black text-lg text-blue-700 mb-2">
              stackslance.
            </p>
            <p>Decentralized freelance marketplace on Stacks blockchain.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
