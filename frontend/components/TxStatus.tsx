"use client";

type Status = "idle" | "pending" | "success" | "error";
type Props = { status: Status; txId?: string; error?: string };

const EXPLORER = "https://explorer.hiro.so/txid";

export default function TxStatus({ status, txId, error }: Props) {
  if (status === "idle") return null;

  const styles = {
    pending: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-700",
  }[status];

  return (
    <div
      className={`flex items-center gap-2.5 text-sm border rounded-xl-xl px-4 py-3 mt-3 ${styles}`}
    >
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
      {status === "success" && <span className="shrink-0">✓</span>}
      {status === "error" && <span className="shrink-0">✕</span>}

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
