import type { EncryptedCase, Hearing, Status } from '../../backend';

export interface DecryptedCase {
  caseNumber: string;
  creationDate: string;
  nextHearing: string;
  clientName: string;
  clientContact: string;
  evidence: string[];
  hearings: DecryptedHearing[];
  status: Status;
  archived?: boolean;
}

export interface DecryptedHearing {
  date: string;
  outcome: string;
  notes: string;
  status: Status;
}

export async function encryptCase(
  decryptedCase: DecryptedCase,
  encryptFn: (text: string) => Promise<string>
): Promise<EncryptedCase> {
  const encryptedHearings: Hearing[] = await Promise.all(
    decryptedCase.hearings.map(async (h) => ({
      date: await encryptFn(h.date),
      outcome: await encryptFn(h.outcome),
      notes: await encryptFn(h.notes),
      status: h.status,
    }))
  );

  const encryptedEvidence = await Promise.all(
    decryptedCase.evidence.map((e) => encryptFn(e))
  );

  return {
    caseNumber: await encryptFn(decryptedCase.caseNumber),
    creationDate: await encryptFn(decryptedCase.creationDate),
    nextHearing: await encryptFn(decryptedCase.nextHearing),
    clientName: await encryptFn(decryptedCase.clientName),
    clientContact: await encryptFn(decryptedCase.clientContact),
    evidence: encryptedEvidence,
    hearings: encryptedHearings,
    status: decryptedCase.status,
  };
}

export async function decryptCase(
  encryptedCase: EncryptedCase,
  decryptFn: (text: string) => Promise<string>
): Promise<DecryptedCase> {
  const decryptedHearings: DecryptedHearing[] = await Promise.all(
    encryptedCase.hearings.map(async (h) => ({
      date: await decryptFn(h.date),
      outcome: await decryptFn(h.outcome),
      notes: await decryptFn(h.notes),
      status: h.status,
    }))
  );

  const decryptedEvidence = await Promise.all(
    encryptedCase.evidence.map((e) => decryptFn(e))
  );

  return {
    caseNumber: await decryptFn(encryptedCase.caseNumber),
    creationDate: await decryptFn(encryptedCase.creationDate),
    nextHearing: await decryptFn(encryptedCase.nextHearing),
    clientName: await decryptFn(encryptedCase.clientName),
    clientContact: await decryptFn(encryptedCase.clientContact),
    evidence: decryptedEvidence,
    hearings: decryptedHearings,
    status: encryptedCase.status,
  };
}
