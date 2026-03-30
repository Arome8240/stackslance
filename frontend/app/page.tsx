"use client";
import { useJobs } from "@/hooks/useJob";

export const dynamic = "force-dynamic";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  SearchNormal1,
  Code1,
  Monitor,
  Brush2,
  Link21,
  Image,
  Chart,
  Lock1,
  Link2,
  Flash,
  Add,
} from "iconsax-react";
import Link from "next/link";

const CATEGORIES = [
  { label: "Smart Contracts", Icon: Code1, color: "#6366f1" },
  { label: "Frontend Dev", Icon: Monitor, color: "#0ea5e9" },
  { label: "UI/UX Design", Icon: Brush2, color: "#ec4899" },
  { label: "Web3 Consulting", Icon: Link21, color: "#f59e0b" },
  { label: "NFT Projects", Icon: Image, color: "#8b5cf6" },
  { label: "DeFi Protocols", Icon: Chart, color: "#10b981" },
];

const TRUST = [
  {
    Icon: Lock1,
    color: "#1d4ed8",
    title: "Trustless Escrow",
    desc: "STX locked on-chain until work is approved",
  },
  {
    Icon: Link2,
    color: "#7c3aed",
    title: "Fully On-Chain",
    desc: "No backend. Smart contract is the source of truth",
  },
  {
    Icon: Flash,
    color: "#f59e0b",
    title: "Instant Settlement",
    desc: "Funds released automatically on approval",
  },
];

export default function Home() {
  const { jobs, loading } = useJobs();
  const openJobs = jobs.filter((j) => j.status === 0);

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-5xl font-black leading-tight max-w-2xl">
            Find the perfect <span className="opacity-80">Web3 freelancer</span>{" "}
            for your project
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl">
            Fully on-chain. Trustless escrow. Powered by Stacks.
          </p>
          <div className="flex w-full max-w-xl rounded-xl overflow-hidden border-2 border-primary-foreground/30 shadow-lg">
            <input
              type="text"
              placeholder="Search for Clarity developer, NFT designer..."
              className="flex-1 px-4 py-3 text-sm text-foreground bg-background outline-none"
            />
            <button className="bg-background hover:bg-accent text-primary font-bold px-5 transition-colors flex items-center gap-2 text-sm">
              <SearchNormal1 size={16} color="#1d4ed8" />
              Search
            </button>
          </div>
          <p className="text-primary-foreground/60 text-sm">
            Popular:{" "}
            <span className="text-primary-foreground font-medium">
              Clarity, NFT, DeFi, DAO, Frontend
            </span>
          </p>
        </div>
      </section>

      {/* Categories */}
      <Separator />
      <section className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-2 overflow-x-auto">
          {CATEGORIES.map(({ label, Icon, color }) => (
            <Badge
              key={label}
              variant="outline"
              className="whitespace-nowrap cursor-pointer hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors px-4 py-2 text-sm gap-2"
            >
              <Icon size={14} color={color} />
              {label}
            </Badge>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Open Jobs</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {loading ? "Loading..." : `${openJobs.length} jobs available`}
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/jobs/create">
              <Add size={17} color="white" />
              Post a Job
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="border rounded-xl h-56 animate-pulse bg-muted"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <SearchNormal1 size={48} color="#9ca3af" className="mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground">
              No jobs posted yet
            </p>
            <p className="text-sm mt-1">
              Be the first to post a job on StacksLance.
            </p>
            <Button asChild size="lg" className="mt-6 gap-2">
              <Link href="/jobs/create">
                <Add size={17} color="white" />
                Post a Job
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Trust */}
      <section className="bg-primary/5 border-y">
        <div className="max-w-7xl mx-auto px-6 py-14 grid sm:grid-cols-3 gap-8 text-center">
          {TRUST.map(({ Icon, color, title, desc }) => (
            <div key={title}>
              <div className="w-12 h-12 rounded-xl bg-white border flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Icon size={24} color={color} variant="Bold" />
              </div>
              <p className="font-bold text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
