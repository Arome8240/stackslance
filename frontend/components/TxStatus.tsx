"use client";

type Status = "idle" | "pending" | "success" | "error";

type Props = {
  status: Status;
  txId?: string;
  error?: string;
};

const EXPLORER_BASE = "https://explorer.hiro.so/txid";

export default function TxStatus({ status, txId, error }: Props) {
  if (status === "idle") return null;

  return (
    <div
      className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
        status === "pending"
          ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
          : status === "success"
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
      }`}
    >
      {status === "pending" && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
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
      {status === "pending" && "Transaction pending..."}
      {status === "success" && (
        <>
          Transaction confirmed.{" "}
          {txId && (
            <a
              href={`${EXPLORER_BASE}/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              View on Explorer
            </a>
          )}
        </>
      )}
      {status === "error" && (error ?? "Transaction failed.")}
    </div>
  );
}
