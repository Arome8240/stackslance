"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useJob, useHasApplied, useApplicantCount } from "@/hooks/useJob";
import { useWallet } from "@/hooks/useWallet";
import { uploadToIPFS } from "@/lib/ipfs";
import {
  applyToJob,
  submitWork,
  approveWork,
  raiseDispute,
  assignFreelancer,
} from "@/lib/contract";
import TxStatus from "@/components/TxStatus";
import { JOB_STATUS, STATUS_COLORS, IPFS_GATEWAY } from "@/lib/constants";

type TxState = {
  status: "idle" | "pending" | "success" | "error";
  txId?: string;
  error?: string;
};

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const jobId = parseInt(id);
  const router = useRouter();

  const { job, loading } = useJob(jobId);
  const { address, connect, isConnected } = useWallet();
  const hasApplied = useHasApplied(jobId, address);
  const applicantCount = useApplicantCount(jobId);

  const [proposal, setProposal] = useState("");
  const [submission, setSubmission] = useState("");
  const [freelancerAddr, setFreelancerAddr] = useState("");
  const [tx, setTx] = useState<TxState>({ status: "idle" });
  const [uploading, setUploading] = useState(false);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded-xl w-1/3" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-gray-400">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-lg font-semibold text-gray-600">Job not found</p>
      </div>
    );
  }

  const stx = (job.amount / 1_000_000).toFixed(2);
  const statusLabel = JOB_STATUS[job.status] ?? "Unknown";
  const statusColor = STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-600";
  const isJobClient = address === job.client;
  const isJobFreelancer = address === job.freelancer;
  const busy = uploading || tx.status === "pending";

  function callbacks(): {
    onFinish: (d: { txId: string }) => void;
    onCancel: () => void;
  } {
    return {
      onFinish: ({ txId }) => setTx({ status: "success", txId }),
      onCancel: () => setTx({ status: "idle" }),
    };
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!isConnected) return connect();
    try {
      setUploading(true);
      const cid = await uploadToIPFS({
        proposal,
        applicant: address,
        appliedAt: new Date().toISOString(),
      });
      setUploading(false);
      setTx({ status: "pending" });
      applyToJob(jobId, cid, callbacks());
    } catch (err) {
      setUploading(false);
      setTx({ status: "error", error: (err as Error).message });
    }
  }

  async function handleSubmitWork(e: React.FormEvent) {
    e.preventDefault();
    if (!isConnected) return connect();
    try {
      setUploading(true);
      const cid = await uploadToIPFS({
        submission,
        submittedBy: address,
        submittedAt: new Date().toISOString(),
      });
      setUploading(false);
      setTx({ status: "pending" });
      submitWork(jobId, cid, callbacks());
    } catch (err) {
      setUploading(false);
      setTx({ status: "error", error: (err as Error).message });
    }
  }

  function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!isConnected) return connect();
    setTx({ status: "pending" });
    assignFreelancer(jobId, freelancerAddr, callbacks());
  }

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
        {" / "}
        <span
          className="text-blue-700 font-medium cursor-pointer hover:underline"
          onClick={() => router.push("/")}
        >
          Jobs
        </span>
        {" / "}Job #{job.id}
      </p>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title + status */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-xl-full ${statusColor}`}
              >
                {statusLabel}
              </span>
              <span className="text-xs text-gray-400">Job #{job.id}</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">
              {job.meta?.title ?? `Job #${job.id}`}
            </h1>
          </div>

          {/* Description */}
          {job.meta?.description && (
            <div className="border border-gray-200 rounded-xl-xl p-6">
              <h2 className="font-bold text-gray-800 mb-3">About this job</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {job.meta.description}
              </p>
            </div>
          )}

          {/* Skills */}
          {job.meta?.skills && job.meta.skills.length > 0 && (
            <div className="border border-gray-200 rounded-xl-xl p-6">
              <h2 className="font-bold text-gray-800 mb-3">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {job.meta.skills.map((s) => (
                  <span
                    key={s}
                    className="bg-blue-50 text-blue-700 border border-blue-100 text-sm px-3 py-1 rounded-xl-full font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* On-chain details */}
          <div className="border border-gray-200 rounded-xl-xl p-6">
            <h2 className="font-bold text-gray-800 mb-3">On-chain Details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Client</dt>
                <dd className="font-mono text-gray-700">
                  {job.client.slice(0, 10)}...{job.client.slice(-6)}
                </dd>
              </div>
              {job.freelancer && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Freelancer</dt>
                  <dd className="font-mono text-gray-700">
                    {job.freelancer.slice(0, 10)}...{job.freelancer.slice(-6)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Applicants</dt>
                <dd className="font-semibold text-gray-700">
                  {applicantCount}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Description IPFS</dt>
                <dd>
                  <a
                    href={`${IPFS_GATEWAY}/${job.descriptionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs font-mono"
                  >
                    {job.descriptionHash.slice(0, 16)}...
                  </a>
                </dd>
              </div>
              {job.submissionHash && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Submission IPFS</dt>
                  <dd>
                    <a
                      href={`${IPFS_GATEWAY}/${job.submissionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs font-mono"
                    >
                      {job.submissionHash.slice(0, 16)}...
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Sidebar — actions */}
        <div className="space-y-4">
          {/* Budget card */}
          <div className="border border-gray-200 rounded-xl-xl p-6 shadow-sm">
            <p className="text-3xl font-black text-blue-700">{stx} STX</p>
            <p className="text-xs text-gray-400 mt-1">Locked in escrow</p>

            {/* Apply */}
            {job.status === 0 && !isJobClient && !hasApplied && (
              <form onSubmit={handleApply} className="mt-5 space-y-3">
                <textarea
                  required
                  rows={4}
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  placeholder="Describe your approach and relevant experience..."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  {!isConnected
                    ? "Connect Wallet"
                    : uploading
                      ? "Uploading..."
                      : busy
                        ? "Confirm in wallet..."
                        : "Submit Proposal"}
                </button>
                <TxStatus {...tx} />
              </form>
            )}

            {hasApplied && job.status === 0 && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 font-medium">
                ✓ Proposal submitted — waiting for client to assign
              </div>
            )}

            {/* Assign freelancer */}
            {job.status === 0 && isJobClient && (
              <form onSubmit={handleAssign} className="mt-5 space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  Assign a Freelancer
                </p>
                <input
                  required
                  value={freelancerAddr}
                  onChange={(e) => setFreelancerAddr(e.target.value)}
                  placeholder="SP... wallet address"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  {busy ? "Confirm in wallet..." : "Assign Freelancer"}
                </button>
                <TxStatus {...tx} />
              </form>
            )}

            {/* Submit work */}
            {job.status === 1 && isJobFreelancer && (
              <form onSubmit={handleSubmitWork} className="mt-5 space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  Submit Your Work
                </p>
                <textarea
                  required
                  rows={4}
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                  placeholder="Describe your deliverable, add links or notes..."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  {uploading
                    ? "Uploading..."
                    : busy
                      ? "Confirm in wallet..."
                      : "Submit Work"}
                </button>
                <TxStatus {...tx} />
              </form>
            )}

            {/* Approve / dispute */}
            {job.status === 2 && isJobClient && (
              <div className="mt-5 space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  Review Submission
                </p>
                <button
                  onClick={() => {
                    setTx({ status: "pending" });
                    approveWork(jobId, callbacks());
                  }}
                  disabled={busy}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  {busy ? "Confirm in wallet..." : "Approve & Release Payment"}
                </button>
                <button
                  onClick={() => {
                    setTx({ status: "pending" });
                    raiseDispute(jobId, callbacks());
                  }}
                  disabled={busy}
                  className="w-full border border-red-400 text-red-600 hover:bg-red-50 disabled:opacity-50 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Raise Dispute
                </button>
                <TxStatus {...tx} />
              </div>
            )}

            {/* Freelancer dispute option */}
            {job.status === 2 && isJobFreelancer && (
              <div className="mt-5 space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                  Work submitted — awaiting client approval
                </div>
                <button
                  onClick={() => {
                    setTx({ status: "pending" });
                    raiseDispute(jobId, callbacks());
                  }}
                  disabled={busy}
                  className="w-full border border-red-400 text-red-600 hover:bg-red-50 disabled:opacity-50 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Raise Dispute
                </button>
                <TxStatus {...tx} />
              </div>
            )}

            {/* Terminal states */}
            {job.status === 3 && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 font-medium text-center">
                ✓ Completed — payment released
              </div>
            )}
            {job.status === 4 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 font-medium text-center">
                ⚠ Disputed — awaiting arbitration
              </div>
            )}
            {job.status === 5 && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-600 font-medium text-center">
                Resolved
              </div>
            )}
          </div>

          {/* Client info */}
          <div className="border border-gray-200 rounded-xl-xl p-5 text-sm">
            <p className="font-bold text-gray-800 mb-2">About the Client</p>
            <p className="font-mono text-xs text-gray-500 break-all">
              {job.client}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
