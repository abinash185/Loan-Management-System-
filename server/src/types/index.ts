export const ROLES = {
  ADMIN: "admin",
  SALES: "sales",
  SANCTION: "sanction",
  DISBURSEMENT: "disbursement",
  COLLECTION: "collection",
  BORROWER: "borrower",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const LOAN_STATUS = {
  APPLIED: "APPLIED",         // borrower ne apply kiya (pending)
  SANCTIONED: "SANCTIONED",   // sanction exec ne approve kiya
  REJECTED: "REJECTED",       // sanction exec ne reject kiya (reason ke saath)
  DISBURSED: "DISBURSED",     // funds release ho gaye, collection active
  CLOSED: "CLOSED",           // total paid == total repayment
} as const;
export type LoanStatus = (typeof LOAN_STATUS)[keyof typeof LOAN_STATUS];

export const EMPLOYMENT_MODE = {
  SALARIED: "salaried",
  SELF_EMPLOYED: "self_employed",
  UNEMPLOYED: "unemployed",
} as const;
export type EmploymentMode = (typeof EMPLOYMENT_MODE)[keyof typeof EMPLOYMENT_MODE];