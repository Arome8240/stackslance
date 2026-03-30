"use client";
import { useState, useCallback } from "react";
import {
  connect,
  disconnect as stacksDisconnect,
  isConnected,
  getOrCreateUserSession,
} from "@stacks/connect";
import { NETWORK } from "@/lib/constants";

function getAddress(): string | null {
  try {
    const session = getOrCreateUserSession();
    if (!session.isUserSignedIn()) return null;
    const profile = session.loadUserData();
    return NETWORK === "mainnet"
      ? profile.profile.stxAddress.mainnet
      : profile.profile.stxAddress.testnet;
  } catch {
    return null;
  }
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(getAddress);

  const connectWallet = useCallback(async () => {
    if (isConnected()) return;
    await connect();
    setAddress(getAddress());
  }, []);

  const disconnectWallet = useCallback(() => {
    stacksDisconnect();
    setAddress(null);
  }, []);

  return {
    address,
    connect: connectWallet,
    disconnect: disconnectWallet,
    isConnected: !!address,
  };
}
