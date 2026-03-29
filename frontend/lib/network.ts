import { StacksMainnet, StacksTestnet, StacksDevnet } from "@stacks/network";
import { NETWORK } from "./constants";

export function getNetwork() {
  if (NETWORK === "mainnet") return new StacksMainnet();
  if (NETWORK === "testnet") return new StacksTestnet();
  return new StacksDevnet();
}
