const PINATA_API = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
const PINATA_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "https://gateway.pinata.cloud";

export async function uploadToIPFS(data: object): Promise<string> {
  const token = process.env.NEXT_PUBLIC_PINATA_JWT;
  if (!token) throw new Error("Missing NEXT_PUBLIC_PINATA_JWT");

  const res = await fetch(PINATA_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pinataContent: data }),
  });

  if (!res.ok) throw new Error(`IPFS upload failed: ${res.statusText}`);
  const { IpfsHash } = await res.json();
  return IpfsHash as string;
}

export async function fetchFromIPFS<T>(cid: string): Promise<T> {
  const res = await fetch(`${PINATA_GATEWAY}/ipfs/${cid}`);
  if (!res.ok) throw new Error(`IPFS fetch failed: ${res.statusText}`);
  return res.json() as Promise<T>;
}
