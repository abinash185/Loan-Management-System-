"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { api, getErrorDetails, getErrorMessage } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "./StatusBadge";
import type { DashboardLoan, Payment } from "@/types";

const schema = z.object({
  utr: z.string().trim().regex(/^[A-Za-z0-9]{6,30}$/, "UTR must be 6-30 letters or numbers"),
  amount: z
    .number({ message: "Enter an amount" })
    .positive("Amount must be greater than 0")
    .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, "Max 2 decimal places"),
  paidAt: z.string().min(1, "Select payment date"),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  loanId: string;
  onClose: () => void;
  onChanged: () => void;
}

export function PaymentModal({ loanId, onClose, onChanged }: Props) {
  const { data, loading, error, reload } = useFetch<{ loan: DashboardLoan; payments: Payment[] }>(
    `/collection/loans/${loanId}`
  );
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { utr: "", amount: undefined as unknown as number, paidAt: today },
  });

  const loan = data?.loan;
  const payments = data?.payments ?? [];

  const onSubmit = async (values: FormValues) => {
    if (!loan) return;
    setServerError("");
    setSuccess("");
    if (values.amount > loan.outstanding) {
      setError("amount", { message: `Cannot exceed outstanding (${formatCurrency(loan.outstanding)})` });
      return;
    }
    try {
      const res = await api.post<{ message?: string }>(`/collection/loans/${loanId}/payments`, {
        utr: values.utr.toUpperCase(),
        amount: values.amount,
        paidAt: values.paidAt,
      });
      setSuccess(res.data.message ?? "Payment recorded");
      reset({ utr: "", amount: undefined as unknown as number, paidAt: today });
      await reload();
      onChanged();
    } catch (err) {
      const details = getErrorDetails(err);
      setServerError(details.length ? details.map((d) => d.message).join(". ") : getErrorMessage(err));
    }
  };

  const paidPct = loan ? Math.min(100, Math.round((loan.totalPaid / loan.totalRepayment) * 100)) : 0;

  return (
    <Modal title="Loan collection" onClose={onClose}>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && !loan && <div className="h-40 animate-pulse rounded-xl bg-slate-200" />}

      {loan && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">{loan.borrower.name}</p>
              <p className="text-xs text-slate-500">{loan.borrower.email}</p>
            </div>
            <StatusBadge status={loan.status} />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Total repayment</p>
              <p className="mt-1 text-sm font-semibold">{formatCurrency(loan.totalRepayment)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Paid</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">{formatCurrency(loan.totalPaid)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Outstanding</p>
              <p className="mt-1 text-sm font-semibold text-indigo-700">{formatCurrency(loan.outstanding)}</p>
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${paidPct}%` }} />
          </div>

          {success && (
            <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 size={16} /> {success}
            </p>
          )}

          {loan.status === "DISBURSED" ? (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold">Record payment</p>
              <Input
                label="UTR number"
                placeholder="e.g. UTR000123"
                className="uppercase"
                error={errors.utr?.message}
                {...register("utr")}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Input
                    label="Amount (₹)"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    error={errors.amount?.message}
                    {...register("amount", { valueAsNumber: true })}
                  />
                  <button
                    type="button"
                    onClick={() => setValue("amount", loan.outstanding, { shouldValidate: true })}
                    className="mt-1 text-xs font-medium text-indigo-600 hover:underline"
                  >
                    Pay full outstanding
                  </button>
                </div>
                <Input label="Payment date" type="date" max={today} error={errors.paidAt?.message} {...register("paidAt")} />
              </div>
              {serverError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {serverError}
                </p>
              )}
              <Button type="submit" loading={isSubmitting} className="w-full">
                Record payment
              </Button>
            </form>
          ) : (
            <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
              Loan is fully repaid and closed{loan.closedAt ? ` on ${formatDate(loan.closedAt)}` : ""}.
            </p>
          )}

          <div>
            <p className="mb-2 text-sm font-semibold">Payment history ({payments.length})</p>
            {payments.length === 0 ? (
              <p className="text-sm text-slate-500">No payments yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {payments.map((p) => (
                  <li key={p._id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <div>
                      <p className="font-medium">{p.utr}</p>
                      <p className="text-xs text-slate-500">{formatDate(p.paidAt)}</p>
                    </div>
                    <span className="font-semibold">{formatCurrency(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}