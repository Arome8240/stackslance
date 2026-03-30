import type { Metadata } from "next";
import "./globals.css";
import WalletConnect from "@/components/WalletConnect";
import { Separator } from "@/components/ui/separator";
import { SearchNormal1 } from "iconsax-react";
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
      <body className="min-h-screen bg-background text-foreground antialiased">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
            <Link
              href="/"
              className="text-xl font-black tracking-tight text-primary"
            >
              stacks<span className="text-foreground">lance</span>
              <span className="text-primary">.</span>
            </Link>

            <div className="hidden md:flex flex-1 max-w-md">
              <div className="flex w-full rounded-lg border overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                <input
                  type="text"
                  placeholder="Search for any service..."
                  className="flex-1 px-4 py-2 text-sm bg-background outline-none"
                />
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 transition-colors flex items-center">
                  <SearchNormal1 color="white" size={16} />
                </button>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/jobs/create"
                className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-md hover:bg-accent transition-colors font-medium"
              >
                Post a Job
              </Link>
            </nav>

            <WalletConnect />
          </div>
        </header>

        <main>{children}</main>

        <Separator className="mt-20" />
        <footer className="py-10 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
            <p className="font-black text-lg text-primary mb-1">stackslance.</p>
            <p>Decentralized freelance marketplace on Stacks blockchain.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
