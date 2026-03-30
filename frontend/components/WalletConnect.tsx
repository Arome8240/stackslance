"use client";
import { useWallet } from "@/hooks/useWallet";
import { connect, isConnected, disconnect } from "@stacks/connect";

export default function WalletConnect() {
  const { address } = useWallet();

  //const short = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const authenticated = isConnected();
  return (
    <div className="flex items-center gap-3">
      {authenticated ? (
        <>
          <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-full">
            {address}
          </span>
          <button
            onClick={() => disconnect()}
            className="text-sm text-red-500 hover:text-red-700 transition-colors cursor-pointer"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={async () => await connect()}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
