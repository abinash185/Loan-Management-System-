import type { ComponentProps } from "react";

type Props = ComponentProps<"button"> & {
  variant?: "primary" | "outline" | "danger";
  loading?: boolean;
};

const styles = {
  primary:
    "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700",
  outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({ variant = "primary", loading, disabled, className = "", children, ...props }: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}