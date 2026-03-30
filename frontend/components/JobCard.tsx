"use client";
import Link from "next/link";
import { Job } from "@/hooks/useJob";
import { JOB_STATUS } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

type Props = { job: Job };

export default function JobCard({ job }: Props) {
  const stx = (job.amount / 1_000_000).toFixed(2);

  return (
    <Link href={`/jobs/${job.id}`} className="group block h-full">
      <Card className="h-full flex flex-col hover:shadow-md hover:border-primary/40 transition-all duration-200 overflow-hidden">
        <div className="h-1 bg-primary group-hover:bg-primary/80 transition-colors" />
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-start justify-between gap-2">
            <Badge
              variant={STATUS_VARIANT[job.status] ?? "outline"}
              className="text-xs shrink-0"
            >
              {JOB_STATUS[job.status] ?? "Unknown"}
            </Badge>
            <span className="text-sm font-bold text-primary">{stx} STX</span>
          </div>
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mt-1">
            {job.meta?.title ?? `Job #${job.id}`}
          </h3>
        </CardHeader>

        <CardContent className="px-4 pb-3 flex-1">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {job.meta?.description ?? "No description available."}
          </p>
          {job.meta?.skills && job.meta.skills.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-3">
              {job.meta.skills.slice(0, 3).map((s) => (
                <Badge
                  key={s}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 py-3 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">
            {job.client.slice(0, 6)}...{job.client.slice(-4)}
          </span>
          <span className="text-xs text-primary font-semibold group-hover:underline">
            View →
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
