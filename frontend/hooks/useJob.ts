"use client";
import { useState, useEffect } from "react";
import {
  getJob,
  getJobCount,
  hasApplied,
  getApplicantCount,
} from "@/lib/contract";
import { fetchFromIPFS } from "@/lib/ipfs";

export type JobMeta = {
  title: string;
  description: string;
  skills: string[];
  budget: number; // in STX (display only)
};

export type Job = {
  id: number;
  client: string;
  freelancer: string | null;
  amount: number;
  status: number;
  descriptionHash: string;
  submissionHash: string | null;
  createdAt: number;
  meta?: JobMeta;
};

function cv(val: unknown): unknown {
  if (val && typeof val === "object" && "value" in val) {
    return (val as { value: unknown }).value;
  }
  return val;
}

function parsePrincipal(val: unknown): string | null {
  const unwrapped = cv(val);
  if (!unwrapped) return null;
  if (typeof unwrapped === "string") return unwrapped;
  if (
    typeof unwrapped === "object" &&
    unwrapped !== null &&
    "address" in unwrapped
  )
    return (unwrapped as { address: string }).address;
  return null;
}

function parseJob(id: number, raw: Record<string, unknown>): Job {
  return {
    id,
    client: parsePrincipal(raw.client) ?? "",
    freelancer: parsePrincipal(raw.freelancer),
    amount: Number(cv(raw.amount)),
    status: Number(cv(raw.status)),
    descriptionHash: (cv(raw["description-hash"]) as string) ?? "",
    submissionHash: (cv(raw["submission-hash"]) as string) ?? null,
    createdAt: Number(cv(raw["created-at"]) ?? 0),
  };
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const count = Number(await getJobCount());
        const results = await Promise.all(
          Array.from({ length: count }, (_, i) =>
            getJob(i + 1).then(async (raw) => {
              if (!raw) return null;
              const job = parseJob(i + 1, raw as Record<string, unknown>);
              try {
                job.meta = await fetchFromIPFS<JobMeta>(job.descriptionHash);
              } catch {
                // IPFS fetch failed — show without meta
              }
              //console.log("Jobs", job);
              return job;
            }),
          ),
        );
        setJobs(results.filter(Boolean) as Job[]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { jobs, loading };
}

export function useJob(id: number) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    async function load() {
      try {
        const raw = await getJob(id);
        if (!raw) return;
        console.log("[useJob] raw", JSON.stringify(raw));
        const parsed = parseJob(id, raw as Record<string, unknown>);
        console.log("[useJob] parsed", parsed);
        try {
          parsed.meta = await fetchFromIPFS<JobMeta>(parsed.descriptionHash);
          console.log("[useJob] meta", parsed.meta);
        } catch (e) {
          console.error("[useJob] IPFS error", e);
        }
        setJob(parsed);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, tick]);

  return { job, loading, refetch: () => setTick((t) => t + 1) };
}

export function useHasApplied(jobId: number, address: string | null) {
  const [applied, setApplied] = useState(false);
  useEffect(() => {
    if (!address || !jobId) return;
    hasApplied(jobId, address).then(setApplied);
  }, [jobId, address]);
  return applied;
}

export function useApplicantCount(jobId: number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!jobId) return;
    getApplicantCount(jobId).then(setCount);
  }, [jobId]);
  return count;
}
