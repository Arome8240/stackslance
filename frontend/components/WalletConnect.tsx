"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, LogoutCurve } from "iconsax-react";

export default function WalletConnect() {
  const { address, connect, disconnect, isConnected } = useWallet();
  const [mounted, setMounted] = useState(false);
  const short = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return (
      <Button size="lg" className="gap-2" disabled>
        <Wallet size={16} color="white" />
        Connect Wallet
      </Button>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="font-mono text-xs px-3 py-1.5 gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          {short(address!)}
        </Badge>
        <Button
          variant="ghost"
          size="lg"
          onClick={disconnect}
          className="text-muted-foreground hover:text-destructive gap-1.5"
        >
          <LogoutCurve size={16} color="#ef4444" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connect} size="lg" className="gap-2">
      <Wallet size={16} color="white" />
      Connect Wallet
    </Button>
  );
}
