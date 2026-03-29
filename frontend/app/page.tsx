"use client";
import { useJobs } from "@/hooks/useJob";
import JobCard from "@/components/JobCard";
import Link from "next/link";

export default function Home() {
  const { jobs, loading } = useJobs();
  const openJobs = jobs.filter((j) => j.status === 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Find Work</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? "Loading..." : `${openJobs.length} open jobs`}
          </p>
        </div>
        <Link
          href="/jobs/create"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Post a Job
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl p-5 bg-white animate-pulse h-36"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No jobs yet.</p>
          <p className="text-sm mt-1">Be the first to post one.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
