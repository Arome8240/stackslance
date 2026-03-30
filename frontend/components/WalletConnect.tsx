"use client";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WalletConnect() {
  const { address, connect, disconnect, isConnected } = useWallet();
  const short = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="font-mono text-xs px-3 py-1 gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          {short(address!)}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnect}
          className="text-muted-foreground hover:text-destructive"
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connect} size="sm">
      Connect Wallet
    </Button>
  );
}
