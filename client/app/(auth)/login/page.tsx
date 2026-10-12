"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthShell } from "@/components/ui/AuthShell";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

const DEMO_PASSWORD = "Test@1234";
const demoAccounts = [
  { label: "Admin", email: "admin@lms.com" },
  { label: "Sales", email: "sales@lms.com" },
  { label: "Sanction", email: "sanction@lms.com" },
  { label: "Disbursement", email: "disbursement@lms.com" },
  { label: "Collection", email: "collection@lms.com" },
  { label: "Borrower", email: "borrower@lms.com" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError("");
    try {
      await login(values.email, values.password);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  const fillDemo = (email: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", DEMO_PASSWORD, { shouldValidate: true });
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Login to continue to your account"
      footer={
        <>
          New borrower?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          icon={<Mail size={18} />}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          icon={<Lock size={18} />}
          error={errors.password?.message}
          {...register("password")}
        />
        {serverError && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </p>
        )}
        <Button type="submit" loading={isSubmitting} className="w-full">
          Login
        </Button>
      </form>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Demo accounts (click to fill)</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {demoAccounts.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => fillDemo(a.email)}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-indigo-100 hover:text-indigo-700"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}