"use client";
import { useJobs } from "@/hooks/useJob";
import JobCard from "@/components/JobCard";
import Link from "next/link";

const CATEGORIES = [
  { label: "Smart Contracts", icon: "📄" },
  { label: "Frontend Dev", icon: "🖥️" },
  { label: "UI/UX Design", icon: "🎨" },
  { label: "Web3 Consulting", icon: "🔗" },
  { label: "NFT Projects", icon: "🖼️" },
  { label: "DeFi Protocols", icon: "💱" },
];

export default function Home() {
  const { jobs, loading } = useJobs();
  const openJobs = jobs.filter((j) => j.status === 0);

  return (
    <div>
      {/* Hero */}
      <section className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-5xl font-black leading-tight max-w-2xl">
            Find the perfect{" "}
            <span className="text-blue-200">Web3 freelancer</span> for your
            project
          </h1>
          <p className="text-blue-100 text-lg max-w-xl">
            Fully on-chain. Trustless escrow. Powered by Stacks.
          </p>

          {/* Hero search */}
          <div className="flex w-full max-w-xl border-2 border-white rounded-xl overflow-hidden shadow-lg">
            <input
              type="text"
              placeholder="Search for Clarity developer, NFT designer..."
              className="flex-1 px-4 py-3 text-sm text-gray-800 outline-none"
            />
            <button className="bg-white hover:bg-blue-50 text-blue-700 font-bold px-6 text-sm transition-colors">
              Search
            </button>
          </div>

          <p className="text-blue-200 text-sm">
            Popular:{" "}
            <span className="text-white font-medium">
              Clarity, NFT, DeFi, DAO, Frontend
            </span>
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex gap-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              className="flex items-center gap-2 whitespace-nowrap border border-gray-300 hover:border-blue-700 hover:text-blue-700 text-sm text-gray-600 px-4 py-2 rounded-xl-full transition-colors"
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Job listings */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Open Jobs</h2>
            <p className="text-gray-500 text-sm mt-1">
              {loading ? "Loading..." : `${openJobs.length} jobs available`}
            </p>
          </div>
          <Link
            href="/jobs/create"
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Post a Job
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl-xl h-56 animate-pulse bg-gray-50"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-semibold text-gray-600">
              No jobs posted yet
            </p>
            <p className="text-sm mt-1">
              Be the first to post a job on StacksLance.
            </p>
            <Link
              href="/jobs/create"
              className="inline-block mt-6 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Post a Job
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Trust banner */}
      <section className="bg-blue-50 border-y border-blue-100 py-12">
        <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: "🔒",
              title: "Trustless Escrow",
              desc: "STX locked on-chain until work is approved",
            },
            {
              icon: "⛓️",
              title: "Fully On-Chain",
              desc: "No backend. Smart contract is the source of truth",
            },
            {
              icon: "⚡",
              title: "Instant Settlement",
              desc: "Funds released automatically on approval",
            },
          ].map((f) => (
            <div key={f.title}>
              <p className="text-3xl mb-2">{f.icon}</p>
              <p className="font-bold text-gray-900">{f.title}</p>
              <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
