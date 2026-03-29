"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { uploadToIPFS } from "@/lib/ipfs";
import { createJob } from "@/lib/contract";
import TxStatus from "@/components/TxStatus";

type TxState = {
  status: "idle" | "pending" | "success" | "error";
  txId?: string;
  error?: string;
};

export default function CreateJobPage() {
  const router = useRouter();
  const { address, connect, isConnected } = useWallet();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState("");
  const [tx, setTx] = useState<TxState>({ status: "idle" });
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isConnected) return connect();

    const amountStx = parseFloat(budget);
    if (!amountStx || amountStx <= 0) return;

    try {
      setUploading(true);
      const cid = await uploadToIPFS({
        title,
        description,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        budget: amountStx,
        author: address,
        createdAt: new Date().toISOString(),
      });
      setUploading(false);

      const amountMicroStx = Math.floor(amountStx * 1_000_000);
      setTx({ status: "pending" });

      createJob(cid, amountMicroStx, {
        onFinish: ({ txId }) => {
          setTx({ status: "success", txId });
          setTimeout(() => router.push("/"), 2000);
        },
        onCancel: () => setTx({ status: "idle" }),
      });
    } catch (err) {
      setUploading(false);
      setTx({ status: "error", error: (err as Error).message });
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Post a Job</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white border border-gray-200 rounded-xl p-6"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Build a Clarity smart contract"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the work in detail..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Skills (comma-separated)
          </label>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Clarity, Stacks, TypeScript"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Budget (STX)</label>
          <input
            required
            type="number"
            min="0.000001"
            step="any"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 100"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            This amount will be locked in escrow until work is approved.
          </p>
        </div>

        <button
          type="submit"
          disabled={uploading || tx.status === "pending"}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          {!isConnected
            ? "Connect Wallet to Post"
            : uploading
              ? "Uploading to IPFS..."
              : tx.status === "pending"
                ? "Confirm in wallet..."
                : "Post Job"}
        </button>

        <TxStatus {...tx} />
      </form>
    </div>
  );
}
