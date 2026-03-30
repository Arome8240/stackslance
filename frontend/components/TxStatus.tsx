"use client";
import { TickCircle, CloseCircle, Timer1 } from "iconsax-react";

type Status = "idle" | "pending" | "success" | "error";
type Props = { status: Status; txId?: string; error?: string };

const EXPLORER = "https://explorer.hiro.so/txid";

export default function TxStatus({ status, txId, error }: Props) {
  if (status === "idle") return null;

  const base =
    "flex items-center gap-2.5 text-sm rounded-lg border px-4 py-3 mt-3";
  const styles = {
    pending: `${base} bg-primary/5 border-primary/20 text-primary`,
    success: `${base} bg-green-50 border-green-200 text-green-700`,
    error: `${base} bg-destructive/5 border-destructive/20 text-destructive`,
  }[status];

  return (
    <div className={styles}>
      {status === "pending" && (
        <Timer1 size={16} color="#3b82f6" className="shrink-0 animate-pulse" />
      )}
      {status === "success" && (
        <TickCircle
          size={16}
          color="#16a34a"
          variant="Bold"
          className="shrink-0"
        />
      )}
      {status === "error" && (
        <CloseCircle
          size={16}
          color="#dc2626"
          variant="Bold"
          className="shrink-0"
        />
      )}
      <span>
        {status === "pending" && "Waiting for confirmation..."}
        {status === "success" && (
          <>
            Transaction confirmed.{" "}
            {txId && (
              <a
                href={`${EXPLORER}/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                View on Explorer
              </a>
            )}
          </>
        )}
        {status === "error" &&
          (error ?? "Transaction failed. Please try again.")}
      </span>
    </div>
  );
}
