"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TEACHER_ID } from "@/lib/constants";

export default function Home() {
  const [teacherId, setTeacherId] = useState(TEACHER_ID);
  const [planId, setPlanId] = useState("");

  const studentUrl = useMemo(() => {
    if (!teacherId || !planId) return "";
    return `/s/${teacherId}/${planId}`;
  }, [teacherId, planId]);

  function openStudent() {
    if (!studentUrl) return;
    window.open(studentUrl, "_blank");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Inklue</h1>
          <Link
            className="rounded-lg bg-zinc-800 px-4 py-2 hover:bg-zinc-700"
            href="/dashboard"
          >
            Abrir Dashboard
          </Link>
        </div>

        <p className="mt-6 text-zinc-300 max-w-2xl">
          Copiloto pedagógico inclusivo. Gere planos e atividades para Educação
          Infantil com foco em inclusão (TEA e outros perfis), com saída pronta
          para compartilhar por link/QR.
        </p>

        <div className="mt-10 flex gap-3">
          <Link
            className="rounded-lg bg-indigo-600 px-4 py-2 hover:bg-indigo-500"
            href="/new"
          >
            Criar Plano
          </Link>
          <Link
            className="rounded-lg bg-zinc-800 px-4 py-2 hover:bg-zinc-700"
            href="/dashboard"
          >
            Ver Estatísticas
          </Link>
        </div>

        {/* Card modo aluno */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-lg font-semibold">
            Abrir modo aluno (admin/professor)
          </p>
          <p className="mt-1 text-sm text-white/60">
            Cole o Teacher ID e o ID do plano para visualizar a página do aluno.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              className="w-full rounded-xl bg-zinc-900/60 border border-white/10 px-4 py-3 outline-none"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              placeholder="teacherId (ex: t1)"
            />

            <input
              className="w-full rounded-xl bg-zinc-900/60 border border-white/10 px-4 py-3 outline-none"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              placeholder="planId (cole aqui)"
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              className={`rounded-lg px-4 py-2 ${
                studentUrl
                  ? "bg-zinc-800 hover:bg-zinc-700"
                  : "bg-zinc-800/40 cursor-not-allowed"
              }`}
              onClick={openStudent}
              disabled={!studentUrl}
            >
              Ver modo aluno
            </button>

            {studentUrl && (
              <span className="text-xs text-white/60 break-all">
                {studentUrl}
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
