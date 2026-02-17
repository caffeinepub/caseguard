import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Hearing {
    status: Status;
    date: EncryptedText;
    notes: EncryptedText;
    outcome: EncryptedText;
}
export interface EncryptedCase {
    status: Status;
    clientName: EncryptedText;
    caseNumber: EncryptedText;
    nextHearing: EncryptedText;
    hearings: Array<Hearing>;
    creationDate: EncryptedText;
    evidence: Array<EncryptedText>;
    clientContact: EncryptedText;
}
export interface UserProfile {
    name: string;
    email: string;
    organization: string;
}
export type EncryptedText = string;
export enum Status {
    scheduled = "scheduled",
    closed = "closed",
    reviewingEvidence = "reviewingEvidence",
    open = "open",
    awaitingCourt = "awaitingCourt"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCase(newCase: EncryptedCase): Promise<void>;
    addEvidence(caseNumber: EncryptedText, evidence: EncryptedText): Promise<void>;
    addHearing(caseNumber: EncryptedText, hearing: Hearing): Promise<void>;
    addMultipleCases(cases: Array<EncryptedCase>): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCase(caseNumber: EncryptedText): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCaseByNumber(caseNumber: EncryptedText): Promise<EncryptedCase | null>;
    getCases(): Promise<Array<EncryptedCase>>;
    getCasesByStatus(status: Status): Promise<Array<EncryptedCase>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCase(updatedCase: EncryptedCase): Promise<void>;
    updateStatus(caseNumber: EncryptedText, newStatus: Status): Promise<void>;
}
