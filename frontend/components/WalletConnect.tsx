"use client";
import { useWallet } from "@/hooks/useWallet";

export default function WalletConnect() {
  const { address, connect, disconnect, isConnected } = useWallet();
  const short = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl-full px-3 py-1.5">
          <span className="w-2 h-2 rounded-xl-full bg-green-500 shrink-0" />
          <span className="text-xs font-mono text-blue-800 font-medium">
            {short(address!)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="text-xs text-gray-500 hover:text-red-500 transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
    >
      Connect Wallet
    </button>
  );
}
