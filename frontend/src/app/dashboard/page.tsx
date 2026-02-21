"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { ProfilesBar } from "@/components/Charts";
import Link from "next/link";
import { TEACHER_ID } from "@/lib/constants";
import { PlanList } from "@/components/PlanList";

type Summary = {
  totalPlans: number;
  generatedPlans: number;
  draftPlans: number;
  byProfile: Record<string, number>;
};

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    api
      .get("/stats/summary", { params: { teacherId: TEACHER_ID } })
      .then((r) => setSummary(r.data))
      .catch(() => setSummary(null));
  }, []);

  const barData = useMemo(() => {
    const by = summary?.byProfile ?? {};
    return Object.entries(by).map(([name, value]) => ({ name, value }));
  }, [summary]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-3">
            <Link
              className="rounded-lg bg-zinc-800 px-4 py-2 hover:bg-zinc-700"
              href="/new"
            >
              Novo Plano
            </Link>
            <Link
              className="rounded-lg bg-zinc-800 px-4 py-2 hover:bg-zinc-700"
              href="/"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard title="Planos criados" value={summary?.totalPlans ?? "-"} />
          <StatCard
            title="Planos gerados (IA)"
            value={summary?.generatedPlans ?? "-"}
          />
          <StatCard title="Rascunhos" value={summary?.draftPlans ?? "-"} />
        </div>

        {/* <div className="mt-6">
          <ProfilesBar data={barData} />
        </div> */}
        
        <div className="mt-6">
          <ProfilesBar data={barData} />
        </div>

        <div className="mt-6">
          <PlanList />
        </div>
      </div>
    </main>
  );
}
