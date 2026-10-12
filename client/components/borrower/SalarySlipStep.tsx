"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileText, UploadCloud } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import type { ApiSuccess, BorrowerProfile } from "@/types";

const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE = 5 * 1024 * 1024;

interface Props {
  existing?: BorrowerProfile["salarySlip"];
  onBack: () => void;
  onDone: () => void;
}

export function SalarySlipStep({ existing, onBack, onDone }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const pick = (f: File | undefined) => {
    setError("");
    if (!f) return;
    if (!ALLOWED.includes(f.type)) return setError("Only PDF, JPG or PNG files are allowed");
    if (f.size > MAX_SIZE) return setError("File is too large (max 5 MB)");
    setFile(f);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("salarySlip", file);
      await api.post<ApiSuccess<unknown>>("/borrower/salary-slip", form);
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <div>
        <h2 className="text-xl font-semibold">Upload salary slip</h2>
        <p className="mt-1 text-sm text-slate-500">PDF, JPG or PNG. Maximum 5 MB.</p>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40"
      >
        {file ? <FileText className="text-indigo-600" size={32} /> : <UploadCloud className="text-slate-400" size={32} />}
        <span className="text-sm font-medium text-slate-700">
          {file ? file.name : "Click to choose a file"}
        </span>
        {file && <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</span>}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />

      {existing?.path && !file && (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 size={16} /> Already uploaded: {existing.originalName}. You can continue or replace it.
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onBack} type="button">
          Back
        </Button>
        {file ? (
          <Button onClick={upload} loading={uploading} type="button">
            Upload & continue
          </Button>
        ) : (
          <Button onClick={onDone} disabled={!existing?.path} type="button">
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}