import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SiteStats {
    pendingCount: bigint;
    approvedCount: bigint;
    totalUsers: bigint;
    totalDeposits: bigint;
    rejectedCount: bigint;
}
export interface Faq {
    question: string;
    answer: string;
}
export type Time = bigint;
export interface DepositOutput {
    id: bigint;
    status: DepositStatus;
    asset: string;
    screenshotBlobId?: string;
    txid: string;
    timestamp: Time;
    amount: bigint;
}
export interface DepositInput {
    asset: string;
    screenshotBlobId?: string;
    txid: string;
    amount: bigint;
}
export interface UserProfile {
    name: string;
}
export enum DepositStatus {
    verified = "verified",
    pending = "pending",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveDeposit(depositId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllDeposits(): Promise<Array<DepositOutput>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFAQs(): Promise<Array<Faq>>;
    getMyDeposits(): Promise<Array<DepositOutput>>;
    getPolicy(): Promise<string>;
    getSiteStats(): Promise<SiteStats>;
    getTerms(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    rejectDeposit(depositId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setFAQs(newFaqs: Array<Faq>): Promise<void>;
    setPolicy(policyText: string): Promise<void>;
    setTerms(terms: string): Promise<void>;
    submitDeposit(input: DepositInput): Promise<bigint>;
}
