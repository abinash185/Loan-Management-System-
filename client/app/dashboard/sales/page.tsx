"use client";

import { useFetch } from "@/hooks/useFetch";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TableShell } from "@/components/dashboard/TableShell";
import { BorrowerCell } from "@/components/dashboard/BorrowerCell";
import { td, th } from "@/components/dashboard/table";
import type { Lead } from "@/types";

export default function SalesPage() {
  const { data, loading, error, reload } = useFetch<{ count: number; leads: Lead[] }>("/sales/leads");
  const leads = data?.leads ?? [];
  const count = (stage: Lead["stage"]) => leads.filter((l) => l.stage === stage).length;

  const stats = [
    { label: "Total leads", value: leads.length },
    { label: "Registered only", value: count("REGISTERED") },
    { label: "Details saved", value: count("DETAILS_SAVED") },
    { label: "Slip uploaded", value: count("SLIP_UPLOADED") },
  ];

  return (
    <>
      <PageHeader title="Sales" subtitle="Registered borrowers who have not applied for a loan yet." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <TableShell
        loading={loading}
        error={error}
        isEmpty={leads.length === 0}
        emptyText="No leads right now. Everyone who registered has applied."
        onRetry={reload}
      >
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className={th}>Lead</th>
              <th className={th}>Registered on</th>
              <th className={th}>Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((l) => (
              <tr key={l.id}>
                <td className={td}>
                  <BorrowerCell name={l.name} email={l.email} />
                </td>
                <td className={td}>{formatDate(l.registeredAt)}</td>
                <td className={td}>
                  <StatusBadge status={l.stage} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </>
  );
}