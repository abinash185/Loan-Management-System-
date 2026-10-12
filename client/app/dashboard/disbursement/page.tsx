"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
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

type Tab = "SANCTIONED" | "DISBURSED";
const TABS: { value: Tab; label: string }[] = [
  { value: "SANCTIONED", label: "Ready to disburse" },
  { value: "DISBURSED", label: "Disbursed" },
];

export default function DisbursementPage() {
  const [tab, setTab] = useState<Tab>("SANCTIONED");
  const { data, loading, error, reload } = useFetch<{ count: number; loans: DashboardLoan[] }>(
    `/disbursement/loans?status=${tab}`
  );
  const loans = data?.loans ?? [];

  const [target, setTarget] = useState<DashboardLoan | null>(null);
  const [busy, setBusy] = useState(false);
  const [modalError, setModalError] = useState("");
  const [notice, setNotice] = useState<NoticeState | null>(null);

  const disburse = async () => {
    if (!target) return;
    setBusy(true);
    setModalError("");
    try {
      await api.patch(`/disbursement/loans/${target._id}/disburse`);
      setNotice({ type: "success", message: `${formatCurrency(target.amount)} disbursed to ${target.borrower.name}.` });
      setTarget(null);
      await reload();
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Disbursement" subtitle="Release funds for sanctioned loans." />
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
              <th className={th}>Amount</th>
              <th className={th}>Tenure</th>
              <th className={th}>Total repayment</th>
              <th className={th}>{tab === "SANCTIONED" ? "Sanctioned on" : "Disbursed on"}</th>
              <th className={th}>Status</th>
              {tab === "SANCTIONED" && <th className={th}>Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loans.map((l) => (
              <tr key={l._id}>
                <td className={td}>
                  <BorrowerCell name={l.borrower.name} email={l.borrower.email} />
                </td>
                <td className={td}>{formatCurrency(l.amount)}</td>
                <td className={td}>{l.tenureDays} days</td>
                <td className={td}>{formatCurrency(l.totalRepayment)}</td>
                <td className={td}>
                  {tab === "SANCTIONED"
                    ? l.sanctionedAt && formatDate(l.sanctionedAt)
                    : l.disbursedAt && formatDate(l.disbursedAt)}
                </td>
                <td className={td}>
                  <StatusBadge status={l.status} />
                </td>
                {tab === "SANCTIONED" && (
                  <td className={td}>
                    <button
                      onClick={() => {
                        setTarget(l);
                        setModalError("");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                      <Send size={13} /> Disburse
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      {target && (
        <Modal title="Disburse loan" onClose={() => setTarget(null)}>
          <p className="text-sm text-slate-600">
            Release <strong>{formatCurrency(target.amount)}</strong> to <strong>{target.borrower.name}</strong>? The loan
            will move to <strong>DISBURSED</strong> and become available for collection.
          </p>
          {modalError && (
            <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {modalError}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setTarget(null)}>
              Cancel
            </Button>
            <Button loading={busy} onClick={() => void disburse()}>
              Confirm disbursement
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}