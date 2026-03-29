"use client";
import Link from "next/link";
import { Job } from "@/hooks/useJob";
import { JOB_STATUS, STATUS_COLORS } from "@/lib/constants";

type Props = { job: Job };

export default function JobCard({ job }: Props) {
  const stx = (job.amount / 1_000_000).toFixed(2);
  const statusLabel = JOB_STATUS[job.status] ?? "Unknown";
  const statusColor = STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-800";

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {job.meta?.title ?? `Job #${job.id}`}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {job.meta?.description ?? job.descriptionHash}
            </p>
          </div>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex gap-2 flex-wrap">
            {job.meta?.skills?.slice(0, 3).map((s) => (
              <span key={s} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                {s}
              </span>
            ))}
          </div>
          <span className="font-semibold text-orange-600">{stx} STX</span>
        </div>

        <p className="mt-2 text-xs text-gray-400 font-mono truncate">
          {job.client.slice(0, 8)}...{job.client.slice(-6)}
        </p>
      </div>
    </Link>
  );
}
