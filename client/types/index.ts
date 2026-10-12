export const ROLES = {
  ADMIN: "admin",
  SALES: "sales",
  SANCTION: "sanction",
  DISBURSEMENT: "disbursement",
  COLLECTION: "collection",
  BORROWER: "borrower",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiFieldError {
  field?: string;
  rule?: string;
  message: string;
}


export const EMPLOYMENT_MODE = {
  SALARIED: "salaried",
  SELF_EMPLOYED: "self_employed",
  UNEMPLOYED: "unemployed",
} as const;
export type EmploymentMode = (typeof EMPLOYMENT_MODE)[keyof typeof EMPLOYMENT_MODE];

export type LoanStatus = "APPLIED" | "SANCTIONED" | "REJECTED" | "DISBURSED" | "CLOSED";

export interface BorrowerProfile {
  _id: string;
  fullName: string;
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  salarySlip?: { path?: string; originalName?: string; mimeType?: string; size?: number };
}

export interface Loan {
  _id: string;
  amount: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  totalPaid: number;
  outstanding: number;
  status: LoanStatus;
  rejectionReason?: string;
  createdAt: string;
  sanctionedAt?: string;
  disbursedAt?: string;
  closedAt?: string;
}

export interface DashboardLoan extends Loan {
  borrower: { _id: string; name: string; email: string };
  profile: Pick<BorrowerProfile, "fullName" | "pan" | "dob" | "monthlySalary" | "employmentMode"> & {
    salarySlip?: { originalName?: string; mimeType?: string; size?: number };
  };
}

export interface Payment {
  _id: string;
  utr: string;
  amount: number;
  paidAt: string;
  createdAt: string;
}

export type LeadStage = "REGISTERED" | "DETAILS_SAVED" | "SLIP_UPLOADED";

export interface Lead {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  stage: LeadStage;
}