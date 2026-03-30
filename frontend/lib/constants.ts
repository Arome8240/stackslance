export const CONTRACT_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"; // replace with deployed address
export const CONTRACT_NAME = "freelance-marketplace";
export const NETWORK: "mainnet" | "testnet" | "devnet" = "devnet";

export const JOB_STATUS: Record<number, string> = {
  0: "Open",
  1: "Assigned",
  2: "Submitted",
  3: "Completed",
  4: "Disputed",
  5: "Resolved",
};

export const STATUS_COLORS: Record<number, string> = {
  0: "bg-blue-100 text-blue-800",
  1: "bg-yellow-100 text-yellow-800",
  2: "bg-purple-100 text-purple-800",
  3: "bg-green-100 text-green-800",
  4: "bg-red-100 text-red-800",
  5: "bg-gray-100 text-gray-800",
};

export const IPFS_GATEWAY = "https://ipfs.io/ipfs";
