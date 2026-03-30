"use client";
import { useState, useCallback } from "react";
import {
  connect,
  disconnect as stacksDisconnect,
  isConnected,
  getLocalStorage,
} from "@stacks/connect";

const getAddress = (): string | null => {
  const userData = getLocalStorage();
  if (userData?.addresses) {
    const stxAddress = userData.addresses.stx[0].address;
    console.log("STX:", stxAddress);
    return stxAddress;
  }
  return null;
};

export function useWallet() {
  const [address, setAddress] = useState<string | null>(getAddress);
  const authenticated = isConnected();

  const connectWallet = useCallback(async () => {
    if (isConnected()) {
      console.log("Already authenticated");
      return;
    }
    const response = await connect();
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
    isConnected: authenticated,
  };
}
