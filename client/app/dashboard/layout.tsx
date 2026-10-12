"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Banknote, ClipboardCheck, Landmark, LogOut, Menu, Users, Wallet, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLES, type Role } from "@/types";

const MODULES: { key: Role; label: string; href: string; icon: typeof Users }[] = [
  { key: ROLES.SALES, label: "Sales", href: "/dashboard/sales", icon: Users },
  { key: ROLES.SANCTION, label: "Sanction", href: "/dashboard/sanction", icon: ClipboardCheck },
  { key: ROLES.DISBURSEMENT, label: "Disbursement", href: "/dashboard/disbursement", icon: Banknote },
  { key: ROLES.COLLECTION, label: "Collection", href: "/dashboard/collection", icon: Wallet },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const items = MODULES.filter((m) => user?.role === ROLES.ADMIN || m.key === user?.role);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-5 text-lg font-semibold text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500">
          <Landmark size={18} />
        </span>
        LMS Ops
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-medium text-white">{user?.name}</p>
        <p className="text-xs capitalize text-slate-400">{user?.role}</p>
        <button
          onClick={logout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) return <div className="m-8 h-64 animate-pulse rounded-2xl bg-slate-200" />;

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-slate-900 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2 font-semibold text-indigo-700">
          <Landmark size={20} /> LMS Ops
        </div>
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-slate-900">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 text-slate-300"
            >
              <X size={20} />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}