"use client";

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
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      )}
      {status === "success" && <span className="shrink-0 font-bold">✓</span>}
      {status === "error" && <span className="shrink-0 font-bold">✕</span>}
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
