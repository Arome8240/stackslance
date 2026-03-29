// IPFS upload via web3.storage or nft.storage public API
// Using the public w3s HTTP API — swap for your own token in production

const IPFS_API = "https://api.web3.storage/upload";

export async function uploadToIPFS(data: object): Promise<string> {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const file = new File([blob], "data.json");

  const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;
  if (!token) throw new Error("Missing NEXT_PUBLIC_WEB3_STORAGE_TOKEN");

  const res = await fetch(IPFS_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: file,
  });

  if (!res.ok) throw new Error(`IPFS upload failed: ${res.statusText}`);
  const { cid } = await res.json();
  return cid as string;
}

export async function fetchFromIPFS<T>(cid: string): Promise<T> {
  const res = await fetch(`https://ipfs.io/ipfs/${cid}`);
  if (!res.ok) throw new Error(`IPFS fetch failed: ${res.statusText}`);
  return res.json() as Promise<T>;
}
