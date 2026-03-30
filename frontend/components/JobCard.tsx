"use client";
import Link from "next/link";
import { Job } from "@/hooks/useJob";
import { JOB_STATUS, STATUS_COLORS } from "@/lib/constants";

type Props = { job: Job };

export default function JobCard({ job }: Props) {
  const stx = (job.amount / 1_000_000).toFixed(2);
  const statusLabel = JOB_STATUS[job.status] ?? "Unknown";
  const statusColor = STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-600";

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="border border-gray-200 rounded-xl-xl overflow-hidden hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group bg-white h-full flex flex-col">
        {/* Card header band */}
        <div className="h-2 bg-blue-700 group-hover:bg-blue-600 transition-colors" />

        <div className="p-4 flex flex-col flex-1 gap-3">
          {/* Status + amount */}
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-xl-full ${statusColor}`}
            >
              {statusLabel}
            </span>
            <span className="text-sm font-bold text-blue-700">{stx} STX</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
            {job.meta?.title ?? `Job #${job.id}`}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-500 line-clamp-2 flex-1">
            {job.meta?.description ?? "No description available."}
          </p>

          {/* Skills */}
          {job.meta?.skills && job.meta.skills.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {job.meta.skills.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-xl-full"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-mono">
              {job.client.slice(0, 6)}...{job.client.slice(-4)}
            </span>
            <span className="text-xs text-blue-700 font-semibold group-hover:underline">
              View Job →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
