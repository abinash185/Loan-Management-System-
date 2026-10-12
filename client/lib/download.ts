import { api } from "./api";

export async function downloadSalarySlip(loanId: string, filename?: string) {
  const res = await api.get<Blob>(`/sanction/loans/${loanId}/salary-slip`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? "salary-slip";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}