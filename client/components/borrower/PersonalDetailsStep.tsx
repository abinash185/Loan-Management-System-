"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, XCircle } from "lucide-react";
import { api, getErrorDetails, getErrorMessage } from "@/lib/api";
import { checkEligibility } from "@/lib/bre";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { ApiFieldError, ApiSuccess, BorrowerProfile } from "@/types";

const schema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  pan: z.string().trim().toUpperCase().min(1, "PAN is required"),
  dob: z.string().min(1, "Date of birth is required"),
  monthlySalary: z.number({ message: "Enter your monthly salary" }).min(0, "Salary cannot be negative"),
  employmentMode: z.enum(["salaried", "self_employed", "unemployed"]),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  profile: BorrowerProfile | null;
  onDone: (profile: BorrowerProfile) => void;
}

export function PersonalDetailsStep({ profile, onDone }: Props) {
  const [rejections, setRejections] = useState<ApiFieldError[]>([]);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: profile?.fullName ?? "",
      pan: profile?.pan ?? "",
      dob: profile?.dob ? profile.dob.slice(0, 10) : "",
      monthlySalary: profile?.monthlySalary as number,
      employmentMode: profile?.employmentMode ?? "salaried",
    },
  });

  // Live hints (UX only). Asli faisla server ka hai.
  const w = useWatch({ control });
  const hints =
    w.dob && w.pan && typeof w.monthlySalary === "number" && !Number.isNaN(w.monthlySalary)
      ? checkEligibility({
          pan: w.pan.toUpperCase(),
          dob: w.dob,
          monthlySalary: w.monthlySalary,
          employmentMode: w.employmentMode ?? "salaried",
        })
      : [];

  const onSubmit = async (values: FormValues) => {
    setServerError("");
    setRejections([]);
    try {
      const res = await api.post<ApiSuccess<{ profile: BorrowerProfile }>>("/borrower/profile", values);
      onDone(res.data.data.profile);
    } catch (err) {
      const details = getErrorDetails(err);
      if (details.length) setRejections(details);
      else setServerError(getErrorMessage(err));
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"
    >
      <div>
        <h2 className="text-xl font-semibold">Personal details</h2>
        <p className="mt-1 text-sm text-slate-500">We check your eligibility as soon as you continue.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Full name" placeholder="As per PAN card" error={errors.fullName?.message} {...register("fullName")} />
        <Input
          label="PAN"
          placeholder="ABCDE1234F"
          maxLength={10}
          className="uppercase"
          error={errors.pan?.message}
          {...register("pan")}
        />
        <Input label="Date of birth" type="date" max={today} error={errors.dob?.message} {...register("dob")} />
        <Input
          label="Monthly salary (₹)"
          type="number"
          inputMode="numeric"
          placeholder="e.g. 50000"
          error={errors.monthlySalary?.message}
          {...register("monthlySalary", { valueAsNumber: true })}
        />
      </div>

      <Select label="Employment mode" error={errors.employmentMode?.message} {...register("employmentMode")}>
        <option value="salaried">Salaried</option>
        <option value="self_employed">Self-employed</option>
        <option value="unemployed">Unemployed</option>
      </Select>

      {hints.length > 0 && rejections.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle size={16} /> You may not be eligible
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {hints.map((h) => (
              <li key={h.rule}>{h.message}</li>
            ))}
          </ul>
        </div>
      )}

      {rejections.length > 0 && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="flex items-center gap-2 font-semibold">
            <XCircle size={16} /> Application rejected: eligibility criteria not met
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {rejections.map((r, i) => (
              <li key={r.rule ?? i}>{r.message}</li>
            ))}
          </ul>
        </div>
      )}

      {serverError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
        Check eligibility & continue
      </Button>
    </form>
  );
}