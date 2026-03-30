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
      setTx({ status: "pending" });

      createJob(cid, Math.floor(amountStx * 1_000_000), {
        onFinish: ({ txId }) => {
          setTx({ status: "success", txId });
          setTimeout(() => router.push("/"), 2500);
        },
        onCancel: () => setTx({ status: "idle" }),
      });
    } catch (err) {
      setUploading(false);
      setTx({ status: "error", error: (err as Error).message });
    }
  }

  const busy = uploading || tx.status === "pending";

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <p className="text-sm text-gray-400 mb-6">
        <span
          className="text-blue-700 font-medium cursor-pointer hover:underline"
          onClick={() => router.push("/")}
        >
          Home
        </span>
        {" / "}Post a Job
      </p>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Form */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            Post a New Job
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Describe your project. The details are stored on IPFS — only the
            hash goes on-chain.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Job Title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Build a Clarity smart contract for token vesting"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the scope, deliverables, and any requirements..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Required Skills
              </label>
              <input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Clarity, Stacks, TypeScript, React"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              <p className="text-xs text-gray-400 mt-1">Separate with commas</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Budget (STX)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                  STX
                </span>
                <input
                  required
                  type="number"
                  min="0.000001"
                  step="any"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="100"
                  className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Locked in escrow until you approve the work
              </p>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors"
            >
              {!isConnected
                ? "Connect Wallet to Continue"
                : uploading
                  ? "Uploading to IPFS..."
                  : tx.status === "pending"
                    ? "Confirm in Hiro Wallet..."
                    : "Post Job & Lock Escrow"}
            </button>

            <TxStatus {...tx} />
          </form>
        </div>

        {/* Sidebar tips */}
        <div className="space-y-5">
          <div className="border border-blue-100 bg-blue-50 rounded-xl-xl p-5">
            <h3 className="font-bold text-blue-800 mb-3 text-sm">
              How it works
            </h3>
            <ol className="space-y-3 text-sm text-blue-700">
              {[
                "Post your job — details go to IPFS",
                "STX budget is locked in escrow on-chain",
                "Freelancers apply with proposals",
                "You assign the best candidate",
                "Approve work to release payment",
              ].map((step, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-xl-full bg-blue-700 text-white text-xs flex items-center justify-center shrink-0 font-bold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="border border-gray-200 rounded-xl-xl p-5 text-sm text-gray-600 space-y-2">
            <p className="font-semibold text-gray-800">Tips for a great post</p>
            <ul className="space-y-1.5 text-xs text-gray-500 list-disc list-inside">
              <li>Be specific about deliverables</li>
              <li>List required tech stack clearly</li>
              <li>Set a fair budget for quality work</li>
              <li>Mention your timeline expectations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
