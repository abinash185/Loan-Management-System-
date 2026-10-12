import { BadgeCheck, Landmark, ShieldCheck, Zap } from "lucide-react";

const points = [
  { icon: Zap, text: "Instant eligibility check" },
  { icon: BadgeCheck, text: "Transparent 12% p.a. simple interest" },
  { icon: ShieldCheck, text: "Secure, role-based access" },
];

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Branding panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative flex items-center gap-2 text-xl font-semibold">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
            <Landmark size={22} />
          </span>
          LMS
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight">Loans made simple, fast and transparent.</h2>
          <p className="mt-4 text-indigo-100">
            Apply in minutes, track every stage from application to closure.
          </p>
          <ul className="mt-8 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <Icon size={18} />
                </span>
                <span className="text-sm text-indigo-50">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* <p className="relative text-xs text-indigo-200">© {new Date().getFullYear()} Loan Management System</p> */}
        <p className="relative text-xs text-indigo-200">© Loan Management System</p>
      </aside>

      {/* Form panel */}
      <section className="flex items-center justify-center bg-slate-50 p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 text-lg font-semibold text-indigo-700 lg:hidden">
            <Landmark size={22} /> LMS
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>
        </div>
      </section>
    </main>
  );
}