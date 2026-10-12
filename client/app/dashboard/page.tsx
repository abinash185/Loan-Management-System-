"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { homePathForRole } from "@/lib/auth";

export default function DashboardIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace(homePathForRole(user.role));
  }, [loading, user, router]);

  return <div className="p-8 text-sm text-slate-500">Redirecting...</div>;
}