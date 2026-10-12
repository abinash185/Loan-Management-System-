import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Loan, LoanStatus } from "@/types";

const PROGRESS: LoanStatus[] = ["APPLIED", "SANCTIONED", "DISBURSED", "CLOSED"];
const LABEL: Record<LoanStatus, string> = {
  APPLIED: "Applied",
  SANCTIONED: "Sanctioned",
  DISBURSED: "Disbursed",
  CLOSED: "Closed",
  REJECTED: "Rejected",
};
const MESSAGE: Record<LoanStatus, string> = {
  APPLIED: "Your application is under review by our sanction team.",
  SANCTIONED: "Your loan is approved. Disbursement is in progress.",
  DISBURSED: "Funds have been released. Please repay before the tenure ends.",
  CLOSED: "Your loan is fully repaid and closed. Thank you!",
  REJECTED: "Unfortunately your application was not approved.",
};
const BADGE: Record<LoanStatus, string> = {
  APPLIED: "bg-amber-100 text-amber-800",
  SANCTIONED: "bg-blue-100 text-blue-800",
  DISBURSED: "bg-violet-100 text-violet-800",
  CLOSED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
};

interface Props {
  loan: Loan;
  onRefresh: () => void;
  onApplyAgain: () => void;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function LoanStatusCard({ loan, onRefresh, onApplyAgain }: Props) {
  const rejected = loan.status === "REJECTED";
  const currentIdx = PROGRESS.indexOf(loan.status);
  const canReapply = rejected || loan.status === "CLOSED";

  return (
    <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Your loan application</h2>
          <p className="mt-1 text-sm text-slate-500">Applied on {formatDate(loan.createdAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${BADGE[loan.status]}`}>
          {LABEL[loan.status]}
        </span>
      </div>

      {rejected ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="flex items-center gap-2 font-semibold">
            <XCircle size={16} /> {MESSAGE.REJECTED}
          </p>
          {loan.rejectionReason && <p className="mt-2">Reason: {loan.rejectionReason}</p>}
        </div>
      ) : (
        <>
          <ol className="flex items-start">
            {PROGRESS.map((s, i) => {
              const done = i < currentIdx || loan.status === "CLOSED";
              const active = i === currentIdx && loan.status !== "CLOSED";
              return (
                <li key={s} className="flex flex-1 flex-col items-center text-center last:flex-none">
                  <div className="flex w-full items-center">
                    <div className={`h-0.5 flex-1 ${i === 0 ? "invisible" : done || active ? "bg-emerald-500" : "bg-slate-200"}`} />
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        done ? "bg-emerald-500 text-white" : active ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {done ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    </span>
                    <div className={`h-0.5 flex-1 ${i === PROGRESS.length - 1 ? "invisible" : done ? "bg-emerald-500" : "bg-slate-200"}`} />
                  </div>
                  <span className={`mt-2 text-xs ${active || done ? "font-medium text-slate-800" : "text-slate-400"}`}>
                    {LABEL[s]}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900">{MESSAGE[loan.status]}</p>
        </>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Loan amount" value={formatCurrency(loan.amount)} />
        <Stat label="Tenure" value={`${loan.tenureDays} days`} />
        <Stat label="Interest" value={`${formatCurrency(loan.simpleInterest)} @ ${loan.interestRate}%`} />
        <Stat label="Total repayment" value={formatCurrency(loan.totalRepayment)} />
        <Stat label="Paid so far" value={formatCurrency(loan.totalPaid)} />
        <Stat label="Outstanding" value={formatCurrency(loan.outstanding)} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onRefresh} type="button">
          Refresh status
        </Button>
        {canReapply && (
          <Button onClick={onApplyAgain} type="button">
            Apply for a new loan
          </Button>
        )}
      </div>
    </div>
  );
}