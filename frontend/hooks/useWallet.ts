"use client";
import { useState, useEffect, useCallback } from "react";
import { showConnect, UserSession, AppConfig } from "@stacks/connect";
import { NETWORK } from "@/lib/constants";

const appConfig = new AppConfig(["store_write", "publish_data"]);
export const userSession = new UserSession({ appConfig });

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const profile = userSession.loadUserData();
      const addr =
        NETWORK === "mainnet"
          ? profile.profile.stxAddress.mainnet
          : profile.profile.stxAddress.testnet;
      setAddress(addr);
    }
  }, []);

  const connect = useCallback(() => {
    showConnect({
      appDetails: { name: "StacksLance", icon: "/favicon.ico" },
      userSession,
      onFinish: () => {
        const profile = userSession.loadUserData();
        const addr =
          NETWORK === "mainnet"
            ? profile.profile.stxAddress.mainnet
            : profile.profile.stxAddress.testnet;
        setAddress(addr);
      },
    });
  }, []);

  const disconnect = useCallback(() => {
    userSession.signUserOut();
    setAddress(null);
  }, []);

  return { address, connect, disconnect, isConnected: !!address };
}
