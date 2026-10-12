"use client";

import { useState } from "react";
import { Check, Download, X } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { downloadSalarySlip } from "@/lib/download";
import { useFetch } from "@/hooks/useFetch";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Tabs } from "@/components/dashboard/Tabs";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TableShell } from "@/components/dashboard/TableShell";
import { BorrowerCell } from "@/components/dashboard/BorrowerCell";
import { Notice, type NoticeState } from "@/components/dashboard/Notice";
import { td, th } from "@/components/dashboard/table";
import type { DashboardLoan } from "@/types";

type Tab = "APPLIED" | "SANCTIONED" | "REJECTED";
const TABS: { value: Tab; label: string }[] = [
  { value: "APPLIED", label: "Pending" },
  { value: "SANCTIONED", label: "Sanctioned" },
  { value: "REJECTED", label: "Rejected" },
];

interface Action {
  type: "approve" | "reject";
  loan: DashboardLoan;
}

export default function SanctionPage() {
  const [tab, setTab] = useState<Tab>("APPLIED");
  const { data, loading, error, reload } = useFetch<{ count: number; loans: DashboardLoan[] }>(
    `/sanction/loans?status=${tab}`
  );
  const loans = data?.loans ?? [];

  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [modalError, setModalError] = useState("");
  const [notice, setNotice] = useState<NoticeState | null>(null);

  const openAction = (type: Action["type"], loan: DashboardLoan) => {
    setAction({ type, loan });
    setReason("");
    setModalError("");
  };

  const submit = async () => {
    if (!action) return;
    if (action.type === "reject" && reason.trim().length < 5) {
      setModalError("Reason must be at least 5 characters");
      return;
    }
    setBusy(true);
    setModalError("");
    try {
      const base = `/sanction/loans/${action.loan._id}`;
      if (action.type === "approve") await api.patch(`${base}/approve`);
      else await api.patch(`${base}/reject`, { reason: reason.trim() });
      setNotice({
        type: "success",
        message: `Loan of ${action.loan.borrower.name} ${action.type === "approve" ? "sanctioned" : "rejected"}.`,
      });
      setAction(null);
      await reload();
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const slip = async (loan: DashboardLoan) => {
    try {
      await downloadSalarySlip(loan._id, loan.profile.salarySlip?.originalName);
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err) });
    }
  };

  return (
    <>
      <PageHeader title="Sanction" subtitle="Review applied loans. Approve or reject with a reason." />
      <Notice notice={notice} onClose={() => setNotice(null)} />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <TableShell
        loading={loading}
        error={error}
        isEmpty={loans.length === 0}
        emptyText="No loans in this list."
        onRetry={reload}
      >
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className={th}>Borrower</th>
              <th className={th}>PAN</th>
              <th className={th}>Salary</th>
              <th className={th}>Amount</th>
              <th className={th}>Tenure</th>
              <th className={th}>Total repayment</th>
              <th className={th}>Applied on</th>
              <th className={th}>Status</th>
              <th className={th}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loans.map((l) => (
              <tr key={l._id}>
                <td className={td}>
                  <BorrowerCell name={l.borrower.name} email={l.borrower.email} />
                </td>
                <td className={td}>{l.profile.pan}</td>
                <td className={td}>{formatCurrency(l.profile.monthlySalary)}</td>
                <td className={td}>{formatCurrency(l.amount)}</td>
                <td className={td}>{l.tenureDays} days</td>
                <td className={td}>{formatCurrency(l.totalRepayment)}</td>
                <td className={td}>{formatDate(l.createdAt)}</td>
                <td className={td}>
                  <StatusBadge status={l.status} />
                  {l.status === "REJECTED" && l.rejectionReason && (
                    <p className="mt-1 max-w-[200px] truncate text-xs text-slate-500" title={l.rejectionReason}>
                      {l.rejectionReason}
                    </p>
                  )}
                </td>
                <td className={td}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => void slip(l)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50"
                    >
                      <Download size={13} /> Slip
                    </button>
                    {l.status === "APPLIED" && (
                      <>
                        <button
                          onClick={() => openAction("approve", l)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                          <Check size={13} /> Approve
                        </button>
                        <button
                          onClick={() => openAction("reject", l)}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                        >
                          <X size={13} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      {action && (
        <Modal title={action.type === "approve" ? "Approve loan" : "Reject loan"} onClose={() => setAction(null)}>
          <p className="text-sm text-slate-600">
            {formatCurrency(action.loan.amount)} for {action.loan.tenureDays} days, applicant{" "}
            <strong>{action.loan.borrower.name}</strong>.
          </p>

          {action.type === "reject" && (
            <div className="mt-4">
              <label htmlFor="reason" className="text-sm font-medium text-slate-700">
                Rejection reason
              </label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Salary slip is not clear"
                className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          )}

          {modalError && (
            <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {modalError}
            </p>
          )}

          <div className="mt-5 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAction(null)}>
              Cancel
            </Button>
            <Button variant={action.type === "approve" ? "primary" : "danger"} loading={busy} onClick={() => void submit()}>
              {action.type === "approve" ? "Confirm approve" : "Confirm reject"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}