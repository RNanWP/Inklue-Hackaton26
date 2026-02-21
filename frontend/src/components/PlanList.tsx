"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { TEACHER_ID } from "@/lib/constants";
import { Button, Card, CardContent, Badge, Input } from "@/components/ui";
import { Eye, Download, Trash2, Search } from "lucide-react";

type PlanRow = {
  teacherId: string;
  planId: string;
  title: string;
  topic: string;
  ageRange: string;
  classSize: number;
  status?: "DRAFT" | "GENERATED";
  createdAt?: string;
  updatedAt?: string;
};

export function PlanList() {
  const [items, setItems] = useState<PlanRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  async function load() {
    setBusy(true);
    try {
      const res = await api.get("/plans", {
        params: { teacherId: TEACHER_ID },
      });
      setItems((res.data?.items ?? res.data ?? []) as PlanRow[]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((p) => {
      return (
        p.title.toLowerCase().includes(s) ||
        p.topic.toLowerCase().includes(s) ||
        p.planId.toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  function openResult(p: PlanRow) {
    window.open(
      `/p/${p.teacherId}/${p.planId}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function downloadPdf(p: PlanRow) {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) {
      alert("NEXT_PUBLIC_API_URL não configurado");
      return;
    }
    const url = `${base}/plans/${p.teacherId}/${p.planId}/pdf?download=1`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function removePlan(p: PlanRow) {
    const ok = confirm(`Excluir o plano "${p.title}"?\nIsso remove do Dynamo.`);
    if (!ok) return;

    setBusy(true);
    try {
      await api.delete(`/plans/${p.teacherId}/${p.planId}`);
      setItems((prev) => prev.filter((x) => x.planId !== p.planId));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border border-white/10 bg-white/5">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-lg font-semibold">Planos</p>
              <p className="text-sm text-white/60">
                Gerencie, abra o resultado em nova aba e baixe o PDF.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={load}
              disabled={busy}
            >
              Recarregar
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <Search className="h-4 w-4 opacity-70" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por título, tema ou ID..."
              className="w-full bg-transparent text-sm outline-none text-white/90 placeholder:text-white/40"
            />
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="border border-white/10 bg-white/5">
          <CardContent className="p-5">
            <Badge tone="yellow">Nenhum plano encontrado</Badge>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card
              key={`${p.teacherId}-${p.planId}`}
              className="border border-white/10 bg-white/5"
            >
              <CardContent className="p-4 md:p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{p.title}</p>
                  <p className="text-sm text-white/70 truncate">
                    Tema: {p.topic}
                  </p>
                  <p className="text-xs text-white/50 font-mono mt-1">
                    {p.teacherId}/{p.planId}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone="blue">Idade: {p.ageRange}</Badge>
                    <Badge tone="blue">Turma: {p.classSize}</Badge>
                    <Badge tone={p.status === "GENERATED" ? "green" : "yellow"}>
                      {p.status ?? "DRAFT"}
                    </Badge>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => openResult(p)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Abrir resultado
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => downloadPdf(p)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removePlan(p)}
                    disabled={busy}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
