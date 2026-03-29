import { describe, it, expect, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";
import { initSimnet } from "@hirosystems/clarinet-sdk";

const simnet = await initSimnet();
const accounts = simnet.getAccounts();

const CLIENT = accounts.get("wallet_1")!;
const FREELANCER = accounts.get("wallet_2")!;
const OTHER = accounts.get("wallet_3")!;
const ARBITRATOR = accounts.get("deployer")!; // matches CONTRACT-OWNER for tests

const CONTRACT = "freelance-marketplace";
const DESC_HASH = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
const PROP_HASH = "QmSomeProposalHashABCDEFGHIJKLMNOPQRSTUVWXYZ1234";
const SUBM_HASH = "QmSubmissionHashABCDEFGHIJKLMNOPQRSTUVWXYZ567890";
const AMOUNT = 1_000_000; // 1 STX in microSTX

describe("create-job", () => {
  it("creates a job and locks STX", () => {
    const { result } = simnet.callPublicFn(
      CONTRACT,
      "create-job",
      [Cl.stringAscii(DESC_HASH), Cl.uint(AMOUNT)],
      CLIENT,
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("rejects zero amount", () => {
    const { result } = simnet.callPublicFn(
      CONTRACT,
      "create-job",
      [Cl.stringAscii(DESC_HASH), Cl.uint(0)],
      CLIENT,
    );
    expect(result).toBeErr(Cl.uint(105));
  });
});

describe("apply-to-job", () => {
  beforeEach(() => {
    simnet.callPublicFn(
      CONTRACT,
      "create-job",
      [Cl.stringAscii(DESC_HASH), Cl.uint(AMOUNT)],
      CLIENT,
    );
  });

  it("freelancer can apply", () => {
    const { result } = simnet.callPublicFn(
      CONTRACT,
      "apply-to-job",
      [Cl.uint(1), Cl.stringAscii(PROP_HASH)],
      FREELANCER,
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("client cannot apply to own job", () => {
    const { result } = simnet.callPublicFn(
      CONTRACT,
      "apply-to-job",
      [Cl.uint(1), Cl.stringAscii(PROP_HASH)],
      CLIENT,
    );
    expect(result).toBeErr(Cl.uint(106)); // ERR-SELF-ASSIGN
  });

  it("cannot apply twice", () => {
    simnet.callPublicFn(
      CONTRACT,
      "apply-to-job",
      [Cl.uint(1), Cl.stringAscii(PROP_HASH)],
      FREELANCER,
    );
    const { result } = simnet.callPublicFn(
      CONTRACT,
      "apply-to-job",
      [Cl.uint(1), Cl.stringAscii(PROP_HASH)],
      FREELANCER,
    );
    expect(result).toBeErr(Cl.uint(103)); // ERR-ALREADY-APPLIED
  });
});

describe("assign-freelancer", () => {
  beforeEach(() => {
    simnet.callPublicFn(
      CONTRACT,
      "create-job",
      [Cl.stringAscii(DESC_HASH), Cl.uint(AMOUNT)],
      CLIENT,
    );
    simnet.callPublicFn(
      CONTRACT,
      "apply-to-job",
      [Cl.uint(1), Cl.stringAscii(PROP_HASH)],
      FREELANCER,
    );
  });

  it("client assigns a freelancer", () => {
    const { result } = simnet.callPublicFn(
      CONTRACT,
      "assign-freelancer",
      [Cl.uint(1), Cl.principal(FREELANCER)],
      CLIENT,
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("non-client cannot assign", () => {
    const { result } = simnet.callPublicFn(
      CONTRACT,
      "assign-freelancer",
      [Cl.uint(1), Cl.principal(FREELANCER)],
      OTHER,
    );
    expect(result).toBeErr(Cl.uint(101)); // ERR-UNAUTHORIZED
  });

  it("cannot assign someone who did not apply", () => {
    const { result } = simnet.callPublicFn(
      CONTRACT,
      "assign-freelancer",
      [Cl.uint(1), Cl.principal(OTHER)],
      CLIENT,
    );
    expect(result).toBeErr(Cl.uint(107)); // ERR-NOT-APPLICANT
  });
});

describe("submit-work", () => {
  beforeEach(() => {
    simnet.callPublicFn(
      CONTRACT,
      "create-job",
      [Cl.stringAscii(DESC_HASH), Cl.uint(AMOUNT)],
      CLIENT,
    );
    simnet.callPublicFn(
      CONTRACT,
      "apply-to-job",
      [Cl.uint(1), Cl.stringAscii(PROP_HASH)],
      FREELANCER,
    );
    simnet.callPublicFn(
      CONTRACT,
      "assign-freelancer",
      [Cl.uint(1), Cl.principal(FREELANCER)],
      CLIENT,
    );
  });

  it("assigned freelancer submits work", () => {
    const { result } = simnet.callPublicFn(
      CONTRACT,
      "submit-work",
      [Cl.uint(1), Cl.stringAscii(SUBM_HASH)],
      FREELANCER,
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("non-freelancer cannot submit", () => {
    const { result } = simnet.callPublicFn(
      CONTRACT,
      "submit-work",
      [Cl.uint(1), Cl.stringAscii(SUBM_HASH)],
      OTHER,
    );
    expect(result).toBeErr(Cl.uint(101));
  });
});

describe("approve-work", () => {
  beforeEach(() => {
    simnet.callPublicFn(
      CONTRACT,
      "create-job",
      [Cl.stringAscii(DESC_HASH), Cl.uint(AMOUNT)],
      CLIENT,
    );
    simnet.callPublicFn(
      CONTRACT,
      "apply-to-job",
      [Cl.uint(1), Cl.stringAscii(PROP_HASH)],
      FREELANCER,
    );
    simnet.callPublicFn(
      CONTRACT,
      "assign-freelancer",
      [Cl.uint(1), Cl.principal(FREELANCER)],
      CLIENT,
    );
    simnet.callPublicFn(
      CONTRACT,
      "submit-work",
      [Cl.uint(1), Cl.stringAscii(SUBM_HASH)],
      FREELANCER,
    );
  });

  it("client approves and releases funds", () => {
    const { result } = simnet.callPublicFn(
      CONTRACT,
      "approve-work",
      [Cl.uint(1)],
      CLIENT,
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("non-client cannot approve", () => {
    const { result } = simnet.callPublicFn(
      CONTRACT,
      "approve-work",
      [Cl.uint(1)],
      OTHER,
    );
    expect(result).toBeErr(Cl.uint(101));
  });
});

describe("dispute flow", () => {
  beforeEach(() => {
    simnet.callPublicFn(
      CONTRACT,
      "create-job",
      [Cl.stringAscii(DESC_HASH), Cl.uint(AMOUNT)],
      CLIENT,
    );
    simnet.callPublicFn(
      CONTRACT,
      "apply-to-job",
      [Cl.uint(1), Cl.stringAscii(PROP_HASH)],
      FREELANCER,
    );
    simnet.callPublicFn(
      CONTRACT,
      "assign-freelancer",
      [Cl.uint(1), Cl.principal(FREELANCER)],
      CLIENT,
    );
    simnet.callPublicFn(
      CONTRACT,
      "submit-work",
      [Cl.uint(1), Cl.stringAscii(SUBM_HASH)],
      FREELANCER,
    );
  });

  it("client raises dispute", () => {
    const { result } = simnet.callPublicFn(
      CONTRACT,
      "raise-dispute",
      [Cl.uint(1)],
      CLIENT,
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("arbitrator resolves in favor of freelancer", () => {
    simnet.callPublicFn(CONTRACT, "raise-dispute", [Cl.uint(1)], CLIENT);
    const { result } = simnet.callPublicFn(
      CONTRACT,
      "resolve-dispute",
      [Cl.uint(1), Cl.bool(true)],
      ARBITRATOR,
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it("non-arbitrator cannot resolve", () => {
    simnet.callPublicFn(CONTRACT, "raise-dispute", [Cl.uint(1)], CLIENT);
    const { result } = simnet.callPublicFn(
      CONTRACT,
      "resolve-dispute",
      [Cl.uint(1), Cl.bool(true)],
      OTHER,
    );
    expect(result).toBeErr(Cl.uint(101));
  });
});

describe("read-only queries", () => {
  beforeEach(() => {
    simnet.callPublicFn(
      CONTRACT,
      "create-job",
      [Cl.stringAscii(DESC_HASH), Cl.uint(AMOUNT)],
      CLIENT,
    );
  });

  it("get-job returns job data", () => {
    const { result } = simnet.callReadOnlyFn(
      CONTRACT,
      "get-job",
      [Cl.uint(1)],
      CLIENT,
    );
    expect(result).toBeSome();
  });

  it("get-job-count returns correct count", () => {
    const { result } = simnet.callReadOnlyFn(
      CONTRACT,
      "get-job-count",
      [],
      CLIENT,
    );
    expect(result).toBeUint(1);
  });

  it("has-applied returns false before applying", () => {
    const { result } = simnet.callReadOnlyFn(
      CONTRACT,
      "has-applied",
      [Cl.uint(1), Cl.principal(FREELANCER)],
      CLIENT,
    );
    expect(result).toBeBool(false);
  });
});
