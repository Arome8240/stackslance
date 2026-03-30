"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { uploadToIPFS } from "@/lib/ipfs";
import { createJob } from "@/lib/contract";
import TxStatus from "@/components/TxStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
      <p className="text-sm text-muted-foreground mb-6">
        <span
          className="text-primary cursor-pointer hover:underline"
          onClick={() => router.push("/")}
        >
          Home
        </span>
        {" / "}Post a Job
      </p>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-black mb-1">Post a New Job</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Details are stored on IPFS — only the hash goes on-chain.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Build a Clarity smart contract for token vesting"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the scope, deliverables, and requirements..."
                className="resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="skills">Required Skills</Label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Clarity, Stacks, TypeScript, React"
              />
              <p className="text-xs text-muted-foreground">
                Separate with commas
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget (STX)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  STX
                </span>
                <Input
                  id="budget"
                  required
                  type="number"
                  min="0.000001"
                  step="any"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="100"
                  className="pl-12"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Locked in escrow until you approve the work
              </p>
            </div>

            <Button type="submit" disabled={busy} className="w-full" size="lg">
              {!isConnected
                ? "Connect Wallet to Continue"
                : uploading
                  ? "Uploading to IPFS..."
                  : tx.status === "pending"
                    ? "Confirm in Hiro Wallet..."
                    : "Post Job & Lock Escrow"}
            </Button>

            <TxStatus {...tx} />
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-primary">
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {[
                  "Post your job — details go to IPFS",
                  "STX budget is locked in escrow on-chain",
                  "Freelancers apply with proposals",
                  "You assign the best candidate",
                  "Approve work to release payment",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-primary/80">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tips for a great post</CardTitle>
            </CardHeader>
            <CardContent>
              <Separator className="mb-3" />
              <ul className="space-y-2 text-xs text-muted-foreground list-disc list-inside">
                <li>Be specific about deliverables</li>
                <li>List required tech stack clearly</li>
                <li>Set a fair budget for quality work</li>
                <li>Mention your timeline expectations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
