import {
  callReadOnlyFunction,
  cvToValue,
  Cl,
  ClarityValue,
  makeStandardSTXPostCondition,
  makeContractSTXPostCondition,
  FungibleConditionCode,
} from "@stacks/transactions";
import { openContractCall } from "@stacks/connect";
import { CONTRACT_ADDRESS, CONTRACT_NAME } from "./constants";
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
  return readOnly("get-job", [Cl.uint(jobId)]);
}

export async function getJobCount(): Promise<number> {
  return readOnly("get-job-count", []);
}

export async function getJobStatus(jobId: number): Promise<number | null> {
  return readOnly("get-job-status", [Cl.uint(jobId)]);
}

export async function hasApplied(
  jobId: number,
  applicant: string,
): Promise<boolean> {
  return readOnly("has-applied", [Cl.uint(jobId), Cl.principal(applicant)]);
}

export async function getApplication(jobId: number, applicant: string) {
  return readOnly("get-application", [Cl.uint(jobId), Cl.principal(applicant)]);
}

export async function getApplicantCount(jobId: number): Promise<number> {
  return readOnly("get-applicant-count", [Cl.uint(jobId)]);
}

export async function isClient(
  jobId: number,
  caller: string,
): Promise<boolean> {
  return readOnly("is-client", [Cl.uint(jobId), Cl.principal(caller)]);
}

export async function isAssignedFreelancer(
  jobId: number,
  caller: string,
): Promise<boolean> {
  return readOnly("is-assigned-freelancer", [
    Cl.uint(jobId),
    Cl.principal(caller),
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
  senderAddress: string,
) {
  const postConditions = [
    makeStandardSTXPostCondition(
      senderAddress,
      FungibleConditionCode.Equal,
      BigInt(amountMicroStx),
    ),
  ];
  openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "create-job",
    functionArgs: [Cl.stringAscii(descriptionHash), Cl.uint(amountMicroStx)],
    network: getNetwork(),
    postConditions,
    onFinish: callbacks.onFinish,
    onCancel: callbacks.onCancel,
  });
}

export function applyToJob(
  jobId: number,
  proposalHash: string,
  callbacks: TxCallbacks,
) {
  contractCall(
    "apply-to-job",
    [Cl.uint(jobId), Cl.stringAscii(proposalHash)],
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
    [Cl.uint(jobId), Cl.principal(freelancer)],
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
    [Cl.uint(jobId), Cl.stringAscii(submissionHash)],
    callbacks,
  );
}

export function approveWork(
  jobId: number,
  amountMicroStx: number,
  freelancer: string,
  callbacks: TxCallbacks,
) {
  const postConditions = [
    makeContractSTXPostCondition(
      CONTRACT_ADDRESS,
      CONTRACT_NAME,
      FungibleConditionCode.Equal,
      BigInt(amountMicroStx),
    ),
  ];
  openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "approve-work",
    functionArgs: [Cl.uint(jobId)],
    network: getNetwork(),
    postConditions,
    onFinish: callbacks.onFinish,
    onCancel: callbacks.onCancel,
  });
}

export function raiseDispute(jobId: number, callbacks: TxCallbacks) {
  contractCall("raise-dispute", [Cl.uint(jobId)], callbacks);
}

export function resolveDispute(
  jobId: number,
  payFreelancer: boolean,
  amountMicroStx: number,
  recipient: string,
  callbacks: TxCallbacks,
) {
  const postConditions = [
    makeContractSTXPostCondition(
      CONTRACT_ADDRESS,
      CONTRACT_NAME,
      FungibleConditionCode.Equal,
      BigInt(amountMicroStx),
    ),
  ];
  openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "resolve-dispute",
    functionArgs: [Cl.uint(jobId), Cl.bool(payFreelancer)],
    network: getNetwork(),
    postConditions,
    onFinish: callbacks.onFinish,
    onCancel: callbacks.onCancel,
  });
}
