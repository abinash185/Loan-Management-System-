"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Tabs } from "@/components/dashboard/Tabs";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TableShell } from "@/components/dashboard/TableShell";
import { BorrowerCell } from "@/components/dashboard/BorrowerCell";
import { PaymentModal } from "@/components/dashboard/PaymentModal";
import { td, th } from "@/components/dashboard/table";
import type { DashboardLoan } from "@/types";

type Tab = "DISBURSED" | "CLOSED";
const TABS: { value: Tab; label: string }[] = [
  { value: "DISBURSED", label: "Active" },
  { value: "CLOSED", label: "Closed" },
];

export default function CollectionPage() {
  const [tab, setTab] = useState<Tab>("DISBURSED");
  const { data, loading, error, reload } = useFetch<{ count: number; loans: DashboardLoan[] }>(
    `/collection/loans?status=${tab}`
  );
  const loans = data?.loans ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <PageHeader title="Collection" subtitle="Record repayments. A loan closes automatically when fully paid." />
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
              <th className={th}>Principal</th>
              <th className={th}>Total repayment</th>
              <th className={th}>Paid</th>
              <th className={th}>Outstanding</th>
              <th className={th}>{tab === "DISBURSED" ? "Disbursed on" : "Closed on"}</th>
              <th className={th}>Status</th>
              <th className={th}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loans.map((l) => (
              <tr key={l._id}>
                <td className={td}>
                  <BorrowerCell name={l.borrower.name} email={l.borrower.email} />
                </td>
                <td className={td}>{formatCurrency(l.amount)}</td>
                <td className={td}>{formatCurrency(l.totalRepayment)}</td>
                <td className={td}>{formatCurrency(l.totalPaid)}</td>
                <td className={`${td} font-semibold`}>{formatCurrency(l.outstanding)}</td>
                <td className={td}>
                  {tab === "DISBURSED"
                    ? l.disbursedAt && formatDate(l.disbursedAt)
                    : l.closedAt && formatDate(l.closedAt)}
                </td>
                <td className={td}>
                  <StatusBadge status={l.status} />
                </td>
                <td className={td}>
                  <button
                    onClick={() => setSelectedId(l._id)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                  >
                    {tab === "DISBURSED" ? "Record payment" : "View"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      {selectedId && (
        <PaymentModal
          key={selectedId}
          loanId={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={() => void reload()}
        />
      )}
    </>
  );
}