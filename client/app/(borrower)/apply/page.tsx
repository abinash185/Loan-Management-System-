"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Stepper } from "@/components/borrower/Stepper";
import { PersonalDetailsStep } from "@/components/borrower/PersonalDetailsStep";
import { SalarySlipStep } from "@/components/borrower/SalarySlipStep";
import { LoanConfigStep } from "@/components/borrower/LoanConfigStep";
import { LoanStatusCard } from "@/components/borrower/LoanStatusCard";
import type { ApiSuccess, BorrowerProfile, Loan } from "@/types";

type Step = 1 | 2 | 3;

export default function ApplyPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [loan, setLoan] = useState<Loan | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [reapplying, setReapplying] = useState(false);

  const load = useCallback(async () => {
    const [p, l] = await Promise.all([
      api.get<ApiSuccess<{ profile: BorrowerProfile | null }>>("/borrower/profile"),
      api.get<ApiSuccess<{ loans: Loan[] }>>("/borrower/loans"),
    ]);
    const prof = p.data.data.profile;
    setProfile(prof);
    setLoan(l.data.data.loans[0] ?? null);
    setStep(prof ? (prof.salarySlip?.path ? 3 : 2) : 1);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  }

  // Loan exist karta hai aur user naya apply nahi kar raha: status dikhao
  if (loan && !reapplying) {
    return (
      <LoanStatusCard
        loan={loan}
        onRefresh={() => void load()}
        onApplyAgain={() => {
          setReapplying(true);
          setStep(3);
        }}
      />
    );
  }

  return (
    <>
      <Stepper current={step} />

      {step === 1 && (
        <PersonalDetailsStep
          profile={profile}
          onDone={(p) => {
            setProfile(p);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <SalarySlipStep
          existing={profile?.salarySlip}
          onBack={() => setStep(1)}
          onDone={() => {
            void load().then(() => setStep(3));
          }}
        />
      )}

      {step === 3 && (
        <LoanConfigStep
          onBack={() => setStep(2)}
          onApplied={(newLoan) => {
            setLoan(newLoan);
            setReapplying(false);
          }}
        />
      )}
    </>
  );
}