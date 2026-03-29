"use client";
import { use, useState } from "react";
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
      <div className="animate-pulse h-64 bg-white rounded-xl border border-gray-200" />
    );
  }

  if (!job) {
    return <p className="text-center text-gray-400 py-20">Job not found.</p>;
  }

  const stx = (job.amount / 1_000_000).toFixed(2);
  const statusLabel = JOB_STATUS[job.status] ?? "Unknown";
  const statusColor = STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-800";
  const isJobClient = address === job.client;
  const isJobFreelancer = address === job.freelancer;

  function txCallbacks(_label: string): {
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
      applyToJob(jobId, cid, txCallbacks("apply"));
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
      submitWork(jobId, cid, txCallbacks("submit"));
    } catch (err) {
      setUploading(false);
      setTx({ status: "error", error: (err as Error).message });
    }
  }

  function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!isConnected) return connect();
    setTx({ status: "pending" });
    assignFreelancer(jobId, freelancerAddr, txCallbacks("assign"));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">
              {job.meta?.title ?? `Job #${job.id}`}
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">
              Client: {job.client.slice(0, 8)}...{job.client.slice(-6)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor}`}
            >
              {statusLabel}
            </span>
            <p className="text-lg font-bold text-orange-600 mt-2">{stx} STX</p>
          </div>
        </div>

        {job.meta?.description && (
          <p className="mt-4 text-sm text-gray-700 leading-relaxed">
            {job.meta.description}
          </p>
        )}

        {job.meta?.skills && job.meta.skills.length > 0 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {job.meta.skills.map((s) => (
              <span
                key={s}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 text-xs text-gray-400 space-y-1">
          <p>
            IPFS:{" "}
            <a
              href={`${IPFS_GATEWAY}/${job.descriptionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {job.descriptionHash.slice(0, 20)}...
            </a>
          </p>
          <p>Applicants: {applicantCount}</p>
          {job.freelancer && (
            <p>
              Freelancer: {job.freelancer.slice(0, 8)}...
              {job.freelancer.slice(-6)}
            </p>
          )}
          {job.submissionHash && (
            <p>
              Submission:{" "}
              <a
                href={`${IPFS_GATEWAY}/${job.submissionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {job.submissionHash.slice(0, 20)}...
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Apply — freelancer, job is OPEN, not client, not already applied */}
      {job.status === 0 && !isJobClient && !hasApplied && (
        <form
          onSubmit={handleApply}
          className="bg-white border border-gray-200 rounded-xl p-6 space-y-4"
        >
          <h2 className="font-semibold">Apply to this Job</h2>
          <textarea
            required
            rows={3}
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="Describe your approach and experience..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
          <button
            type="submit"
            disabled={uploading || tx.status === "pending"}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
          >
            {!isConnected
              ? "Connect Wallet"
              : uploading
                ? "Uploading..."
                : tx.status === "pending"
                  ? "Confirm in wallet..."
                  : "Submit Proposal"}
          </button>
          <TxStatus {...tx} />
        </form>
      )}

      {hasApplied && job.status === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
          You have applied to this job. Waiting for the client to assign a
          freelancer.
        </div>
      )}

      {/* Assign freelancer — client, job is OPEN */}
      {job.status === 0 && isJobClient && (
        <form
          onSubmit={handleAssign}
          className="bg-white border border-gray-200 rounded-xl p-6 space-y-4"
        >
          <h2 className="font-semibold">Assign Freelancer</h2>
          <input
            required
            value={freelancerAddr}
            onChange={(e) => setFreelancerAddr(e.target.value)}
            placeholder="SP... freelancer address"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            disabled={tx.status === "pending"}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
          >
            {tx.status === "pending"
              ? "Confirm in wallet..."
              : "Assign Freelancer"}
          </button>
          <TxStatus {...tx} />
        </form>
      )}

      {/* Submit work — assigned freelancer */}
      {job.status === 1 && isJobFreelancer && (
        <form
          onSubmit={handleSubmitWork}
          className="bg-white border border-gray-200 rounded-xl p-6 space-y-4"
        >
          <h2 className="font-semibold">Submit Work</h2>
          <textarea
            required
            rows={3}
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
            placeholder="Describe your deliverable, include links..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
          <button
            type="submit"
            disabled={uploading || tx.status === "pending"}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
          >
            {uploading
              ? "Uploading..."
              : tx.status === "pending"
                ? "Confirm in wallet..."
                : "Submit Work"}
          </button>
          <TxStatus {...tx} />
        </form>
      )}

      {/* Approve / Dispute — client, work submitted */}
      {job.status === 2 && isJobClient && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <h2 className="font-semibold">Review Submission</h2>
          <p className="text-sm text-gray-500">
            The freelancer has submitted their work. Review it and approve
            payment or raise a dispute.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setTx({ status: "pending" });
                approveWork(jobId, txCallbacks("approve"));
              }}
              disabled={tx.status === "pending"}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
            >
              Approve & Release Payment
            </button>
            <button
              onClick={() => {
                setTx({ status: "pending" });
                raiseDispute(jobId, txCallbacks("dispute"));
              }}
              disabled={tx.status === "pending"}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
            >
              Raise Dispute
            </button>
          </div>
          <TxStatus {...tx} />
        </div>
      )}

      {/* Raise dispute — freelancer side */}
      {job.status === 2 && isJobFreelancer && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          <h2 className="font-semibold">Work Submitted</h2>
          <p className="text-sm text-gray-500">
            Waiting for client to approve. You can also raise a dispute.
          </p>
          <button
            onClick={() => {
              setTx({ status: "pending" });
              raiseDispute(jobId, txCallbacks("dispute"));
            }}
            disabled={tx.status === "pending"}
            className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
          >
            Raise Dispute
          </button>
          <TxStatus {...tx} />
        </div>
      )}

      {/* Terminal states */}
      {job.status === 3 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 text-center">
          Job completed. Payment released to freelancer.
        </div>
      )}
      {job.status === 4 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 text-center">
          Dispute raised. Awaiting arbitrator resolution.
        </div>
      )}
      {job.status === 5 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 text-center">
          Dispute resolved.
        </div>
      )}
    </div>
  );
}
