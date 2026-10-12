"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = ComponentProps<"input"> & {
  label: string;
  error?: string | undefined;
  icon?: ReactNode;
};

export function Input({ label, error, icon, id, type, className = "", ...props }: Props) {
  const [show, setShow] = useState(false);
  const inputId = id ?? props.name;
  const isPassword = type === "password";

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          type={isPassword && show ? "text" : type}
          className={`w-full rounded-xl border bg-white py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${
            icon ? "pl-10" : "pl-3.5"
          } ${isPassword ? "pr-11" : "pr-3.5"} ${
            error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-300"
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}