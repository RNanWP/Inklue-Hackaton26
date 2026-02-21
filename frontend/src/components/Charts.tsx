"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function ProfilesBar({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
      <p className="text-sm text-zinc-400">Planos por perfil de inclusão</p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
