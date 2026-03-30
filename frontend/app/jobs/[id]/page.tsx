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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  ArrowRight2,
  Profile2User,
  Link21,
  MoneyRecive,
  TickCircle,
  Warning2,
  InfoCircle,
  Send2,
  UserAdd,
  DocumentUpload,
  Lock1,
} from "iconsax-react";
import { JOB_STATUS, IPFS_GATEWAY } from "@/lib/constants";

type TxState = {
  status: "idle" | "pending" | "success" | "error";
  txId?: string;
  error?: string;
};

const STATUS_VARIANT: Record<
  number,
  "default" | "secondary" | "outline" | "destructive"
> = {
  0: "default",
  1: "secondary",
  2: "outline",
  3: "secondary",
  4: "destructive",
  5: "outline",
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
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/4" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-muted-foreground">
        <InfoCircle size={48} color="#9ca3af" className="mx-auto mb-4" />
        <p className="text-lg font-semibold text-foreground">Job not found</p>
      </div>
    );
  }

  const stx = (job.amount / 1_000_000).toFixed(2);
  const isJobClient = address === job.client;
  const isJobFreelancer = address === job.freelancer;
  const busy = uploading || tx.status === "pending";

  function callbacks() {
    return {
      onFinish: ({ txId }: { txId: string }) =>
        setTx({ status: "success", txId }),
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
      <p className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
        <span
          className="text-primary cursor-pointer hover:underline"
          onClick={() => router.push("/")}
        >
          Home
        </span>
        <ArrowRight2 size={12} color="#9ca3af" />
        <span
          className="text-primary cursor-pointer hover:underline"
          onClick={() => router.push("/")}
        >
          Jobs
        </span>
        <ArrowRight2 size={12} color="#9ca3af" />
        Job #{job.id}
      </p>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={STATUS_VARIANT[job.status] ?? "outline"}>
                {JOB_STATUS[job.status] ?? "Unknown"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Job #{job.id}
              </span>
            </div>
            <h1 className="text-2xl font-black">
              {job.meta?.title ?? `Job #${job.id}`}
            </h1>
          </div>

          {job.meta?.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <InfoCircle size={16} color="#1d4ed8" variant="Bold" /> About
                  this job
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {job.meta.description}
                </p>
              </CardContent>
            </Card>
          )}

          {job.meta?.skills && job.meta.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DocumentUpload size={16} color="#7c3aed" variant="Bold" />{" "}
                  Skills Required
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 flex flex-wrap gap-2">
                {job.meta.skills.map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="text-sm px-3 py-1"
                  >
                    {s}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Link21 size={16} color="#0ea5e9" variant="Bold" /> On-chain
                Details
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <dl className="space-y-3 text-sm">
                {(
                  [
                    [
                      "Client",
                      `${job.client.slice(0, 10)}...${job.client.slice(-6)}`,
                    ],
                    job.freelancer
                      ? [
                          "Freelancer",
                          `${job.freelancer.slice(0, 10)}...${job.freelancer.slice(-6)}`,
                        ]
                      : null,
                    ["Applicants", String(applicantCount)],
                  ] as (string[] | null)[]
                )
                  .filter(Boolean as unknown as (v: unknown) => v is string[])
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <dt className="text-muted-foreground flex items-center gap-1.5">
                        <Profile2User size={13} color="#6b7280" /> {k}
                      </dt>
                      <dd className="font-mono font-medium">{v}</dd>
                    </div>
                  ))}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <Link21 size={13} color="#6b7280" /> Description IPFS
                  </dt>
                  <dd>
                    <a
                      href={`${IPFS_GATEWAY}/${job.descriptionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs font-mono"
                    >
                      {job.descriptionHash.slice(0, 16)}...
                    </a>
                  </dd>
                </div>
                {job.submissionHash && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground flex items-center gap-1.5">
                      <Link21 size={13} color="#6b7280" /> Submission IPFS
                    </dt>
                    <dd>
                      <a
                        href={`${IPFS_GATEWAY}/${job.submissionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs font-mono"
                      >
                        {job.submissionHash.slice(0, 16)}...
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <MoneyRecive size={22} color="#1d4ed8" variant="Bold" />
                <p className="text-3xl font-black text-primary">{stx} STX</p>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Lock1 size={11} color="#6b7280" /> Locked in escrow
              </p>

              {/* Apply */}
              {job.status === 0 && !isJobClient && !hasApplied && (
                <form onSubmit={handleApply} className="mt-5 space-y-3">
                  <Label className="flex items-center gap-1.5">
                    <Send2 size={13} color="#1d4ed8" /> Your Proposal
                  </Label>
                  <Textarea
                    required
                    rows={4}
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder="Describe your approach and relevant experience..."
                    className="resize-none"
                  />
                  <Button
                    type="submit"
                    disabled={busy}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Send2 size={15} color="white" />
                    {!isConnected
                      ? "Connect Wallet"
                      : uploading
                        ? "Uploading..."
                        : busy
                          ? "Confirm in wallet..."
                          : "Submit Proposal"}
                  </Button>
                  <TxStatus {...tx} />
                </form>
              )}

              {hasApplied && job.status === 0 && (
                <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-primary font-medium flex items-center gap-2">
                  <TickCircle size={14} color="#1d4ed8" variant="Bold" />
                  Proposal submitted — waiting for client to assign
                </div>
              )}

              {/* Assign */}
              {job.status === 0 && isJobClient && (
                <form onSubmit={handleAssign} className="mt-5 space-y-3">
                  <Label className="flex items-center gap-1.5">
                    <UserAdd size={13} color="#1d4ed8" /> Assign a Freelancer
                  </Label>
                  <Input
                    required
                    value={freelancerAddr}
                    onChange={(e) => setFreelancerAddr(e.target.value)}
                    placeholder="SP... wallet address"
                    className="font-mono text-xs"
                  />
                  <Button
                    type="submit"
                    disabled={busy}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <UserAdd size={15} color="white" />
                    {busy ? "Confirm in wallet..." : "Assign Freelancer"}
                  </Button>
                  <TxStatus {...tx} />
                </form>
              )}

              {/* Submit work */}
              {job.status === 1 && isJobFreelancer && (
                <form onSubmit={handleSubmitWork} className="mt-5 space-y-3">
                  <Label className="flex items-center gap-1.5">
                    <DocumentUpload size={13} color="#7c3aed" /> Submit Your
                    Work
                  </Label>
                  <Textarea
                    required
                    rows={4}
                    value={submission}
                    onChange={(e) => setSubmission(e.target.value)}
                    placeholder="Describe your deliverable, add links or notes..."
                    className="resize-none"
                  />
                  <Button
                    type="submit"
                    disabled={busy}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <DocumentUpload size={15} color="white" />
                    {uploading
                      ? "Uploading..."
                      : busy
                        ? "Confirm in wallet..."
                        : "Submit Work"}
                  </Button>
                  <TxStatus {...tx} />
                </form>
              )}

              {/* Approve / dispute */}
              {job.status === 2 && isJobClient && (
                <div className="mt-5 space-y-3">
                  <p className="text-sm font-semibold">Review Submission</p>
                  <Button
                    size="lg"
                    className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                    disabled={busy}
                    onClick={() => {
                      setTx({ status: "pending" });
                      approveWork(jobId, callbacks());
                    }}
                  >
                    <TickCircle size={16} color="white" variant="Bold" />
                    {busy
                      ? "Confirm in wallet..."
                      : "Approve & Release Payment"}
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    className="w-full gap-2"
                    disabled={busy}
                    onClick={() => {
                      setTx({ status: "pending" });
                      raiseDispute(jobId, callbacks());
                    }}
                  >
                    <Warning2 size={16} color="white" variant="Bold" /> Raise
                    Dispute
                  </Button>
                  <TxStatus {...tx} />
                </div>
              )}

              {job.status === 2 && isJobFreelancer && (
                <div className="mt-5 space-y-3">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-primary flex items-center gap-2">
                    <InfoCircle size={13} color="#1d4ed8" variant="Bold" />
                    Work submitted — awaiting client approval
                  </div>
                  <Button
                    size="lg"
                    variant="destructive"
                    className="w-full gap-2"
                    disabled={busy}
                    onClick={() => {
                      setTx({ status: "pending" });
                      raiseDispute(jobId, callbacks());
                    }}
                  >
                    <Warning2 size={16} color="white" variant="Bold" /> Raise
                    Dispute
                  </Button>
                  <TxStatus {...tx} />
                </div>
              )}

              {job.status === 3 && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 font-medium flex items-center gap-2">
                  <TickCircle size={15} color="#16a34a" variant="Bold" />{" "}
                  Completed — payment released
                </div>
              )}
              {job.status === 4 && (
                <div className="mt-4 bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-sm text-destructive font-medium flex items-center gap-2">
                  <Warning2 size={15} color="#dc2626" variant="Bold" /> Disputed
                  — awaiting arbitration
                </div>
              )}
              {job.status === 5 && (
                <div className="mt-4 bg-muted border rounded-lg p-3 text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <InfoCircle size={15} color="#6b7280" /> Resolved
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Profile2User size={15} color="#1d4ed8" variant="Bold" /> About
                the Client
              </p>
              <p className="font-mono text-xs text-muted-foreground break-all">
                {job.client}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
