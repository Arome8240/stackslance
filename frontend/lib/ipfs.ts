const PINATA_API = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
// Use a public CORS-friendly gateway for reads; Pinata's dedicated gateway
// blocks direct browser requests unless you're on a paid plan with a custom domain.
const FETCH_GATEWAY = "https://ipfs.io";

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
  if (!cid) throw new Error("Invalid CID");
  const res = await fetch(`${FETCH_GATEWAY}/ipfs/${cid}`);
  if (!res.ok) throw new Error(`IPFS fetch failed: ${res.statusText}`);
  const json = await res.json();
  // Pinata wraps uploads under pinataContent when using pinJSONToIPFS
  return (json?.pinataContent ?? json) as T;
}
