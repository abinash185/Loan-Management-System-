import { Check } from "lucide-react";

const steps = ["Personal details", "Salary slip", "Loan & apply"];

export function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="mb-8 flex items-center">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {done ? <Check size={16} /> : n}
              </span>
              <span
                className={`hidden text-sm font-medium sm:inline ${active ? "text-slate-900" : "text-slate-500"}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-3 h-0.5 flex-1 ${done ? "bg-emerald-500" : "bg-slate-200"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}