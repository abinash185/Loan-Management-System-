"use client";

import { useState } from "react";
import { api, getErrorDetails, getErrorMessage } from "@/lib/api";
import { calculateLoan, LOAN_LIMITS } from "@/lib/loan";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { ApiSuccess, Loan } from "@/types";

interface Props {
  onBack: () => void;
  onApplied: (loan: Loan) => void;
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={strong ? "text-lg font-bold text-indigo-700" : "text-sm font-medium text-slate-900"}>
        {value}
      </span>
    </div>
  );
}

export function LoanConfigStep({ onBack, onApplied }: Props) {
  const [amount, setAmount] = useState(100000);
  const [tenureDays, setTenureDays] = useState(90);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { simpleInterest, totalRepayment } = calculateLoan(amount, tenureDays);

  const apply = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post<ApiSuccess<{ loan: Loan }>>("/borrower/loans", { amount, tenureDays });
      onApplied(res.data.data.loan);
    } catch (err) {
      const details = getErrorDetails(err);
      setError(details.length ? details.map((d) => d.message).join(". ") : getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="space-y-7 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8 md:col-span-3">
        <div>
          <h2 className="text-xl font-semibold">Configure your loan</h2>
          <p className="mt-1 text-sm text-slate-500">Move the sliders, the calculation updates instantly.</p>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="amount" className="text-sm font-medium text-slate-700">
              Loan amount
            </label>
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(amount)}</span>
          </div>
          <input
            id="amount"
            type="range"
            min={LOAN_LIMITS.MIN_AMOUNT}
            max={LOAN_LIMITS.MAX_AMOUNT}
            step={LOAN_LIMITS.AMOUNT_STEP}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-3 w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>₹50,000</span>
            <span>₹5,00,000</span>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="tenure" className="text-sm font-medium text-slate-700">
              Tenure
            </label>
            <span className="text-2xl font-bold text-slate-900">{tenureDays} days</span>
          </div>
          <input
            id="tenure"
            type="range"
            min={LOAN_LIMITS.MIN_TENURE}
            max={LOAN_LIMITS.MAX_TENURE}
            step={1}
            value={tenureDays}
            onChange={(e) => setTenureDays(Number(e.target.value))}
            className="mt-3 w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>30 days</span>
            <span>365 days</span>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={onBack} type="button">
            Back
          </Button>
          <Button onClick={apply} loading={submitting} type="button">
            Apply for loan
          </Button>
        </div>
      </div>

      <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:col-span-2">
        <h3 className="font-semibold">Loan summary</h3>
        <div className="mt-2 divide-y divide-slate-100">
          <Row label="Principal" value={formatCurrency(amount)} />
          <Row label="Interest rate" value={`${LOAN_LIMITS.INTEREST_RATE}% p.a. (simple)`} />
          <Row label="Tenure" value={`${tenureDays} days`} />
          <Row label="Interest" value={formatCurrency(simpleInterest)} />
          <Row label="Total repayment" value={formatCurrency(totalRepayment)} strong />
        </div>
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          SI = (P × R × T) / (365 × 100)
          <br />
          Total = Principal + SI
        </p>
      </aside>
    </div>
  );
}