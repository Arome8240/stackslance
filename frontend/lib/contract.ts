import {
  callReadOnlyFunction,
  cvToValue,
  stringAsciiCV,
  uintCV,
  principalCV,
  boolCV,
  ClarityValue,
} from "@stacks/transactions";
import { openContractCall } from "@stacks/connect";
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from "./constants";
import { getNetwork } from "./network";

// -----------------------------------------------
// Read-only helpers
// -----------------------------------------------

async function readOnly(fn: string, args: ClarityValue[]) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: fn,
    functionArgs: args,
    network: getNetwork(),
    senderAddress: CONTRACT_ADDRESS,
  });
  return cvToValue(result);
}

export async function getJob(jobId: number) {
  return readOnly("get-job", [uintCV(jobId)]);
}

export async function getJobCount(): Promise<number> {
  return readOnly("get-job-count", []);
}

export async function getJobStatus(jobId: number): Promise<number | null> {
  return readOnly("get-job-status", [uintCV(jobId)]);
}

export async function hasApplied(
  jobId: number,
  applicant: string,
): Promise<boolean> {
  return readOnly("has-applied", [uintCV(jobId), principalCV(applicant)]);
}

export async function getApplication(jobId: number, applicant: string) {
  return readOnly("get-application", [uintCV(jobId), principalCV(applicant)]);
}

export async function getApplicantCount(jobId: number): Promise<number> {
  return readOnly("get-applicant-count", [uintCV(jobId)]);
}

export async function isClient(
  jobId: number,
  caller: string,
): Promise<boolean> {
  return readOnly("is-client", [uintCV(jobId), principalCV(caller)]);
}

export async function isAssignedFreelancer(
  jobId: number,
  caller: string,
): Promise<boolean> {
  return readOnly("is-assigned-freelancer", [
    uintCV(jobId),
    principalCV(caller),
  ]);
}

// -----------------------------------------------
// Write helpers (open Hiro wallet popup)
// -----------------------------------------------

type TxCallbacks = {
  onFinish?: (data: { txId: string }) => void;
  onCancel?: () => void;
};

function contractCall(
  functionName: string,
  functionArgs: ClarityValue[],
  callbacks: TxCallbacks,
) {
  openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName,
    functionArgs,
    network: getNetwork(),
    onFinish: callbacks.onFinish,
    onCancel: callbacks.onCancel,
  });
}

export function createJob(
  descriptionHash: string,
  amountMicroStx: number,
  callbacks: TxCallbacks,
) {
  contractCall(
    "create-job",
    [stringAsciiCV(descriptionHash), uintCV(amountMicroStx)],
    callbacks,
  );
}

export function applyToJob(
  jobId: number,
  proposalHash: string,
  callbacks: TxCallbacks,
) {
  contractCall(
    "apply-to-job",
    [uintCV(jobId), stringAsciiCV(proposalHash)],
    callbacks,
  );
}

export function assignFreelancer(
  jobId: number,
  freelancer: string,
  callbacks: TxCallbacks,
) {
  contractCall(
    "assign-freelancer",
    [uintCV(jobId), principalCV(freelancer)],
    callbacks,
  );
}

export function submitWork(
  jobId: number,
  submissionHash: string,
  callbacks: TxCallbacks,
) {
  contractCall(
    "submit-work",
    [uintCV(jobId), stringAsciiCV(submissionHash)],
    callbacks,
  );
}

export function approveWork(jobId: number, callbacks: TxCallbacks) {
  contractCall("approve-work", [uintCV(jobId)], callbacks);
}

export function raiseDispute(jobId: number, callbacks: TxCallbacks) {
  contractCall("raise-dispute", [uintCV(jobId)], callbacks);
}

export function resolveDispute(
  jobId: number,
  payFreelancer: boolean,
  callbacks: TxCallbacks,
) {
  contractCall(
    "resolve-dispute",
    [uintCV(jobId), boolCV(payFreelancer)],
    callbacks,
  );
}
