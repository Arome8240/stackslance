"use client";
import { useWallet } from "@/hooks/useWallet";

export default function WalletConnect() {
  const { address, connect, disconnect, isConnected } = useWallet();

  const short = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="flex items-center gap-3">
      {isConnected ? (
        <>
          <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-full">
            {short(address!)}
          </span>
          <button
            onClick={disconnect}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={connect}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
