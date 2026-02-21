import {
  Sparkles,
  Flag,
  CheckCircle2,
  PlayCircle,
  Trophy,
  Compass,
  Volume2,
  Hand,
  Eye,
} from "lucide-react";

type Plan = {
  topic: string;
  activities?: string;
  lessonPlan?: string;
  accessibility?: string;
};

async function getPlan(teacherId: string, planId: string): Promise<Plan> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL não configurado");

  const url = `${base}/plans/${teacherId}/${planId}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Falha ao buscar plano: ${res.status} ${res.statusText} | ${body}`,
    );
  }

  return res.json();
}

function toSteps(text?: string, max = 6): string[] {
  const raw = (text || "").trim();
  if (!raw) return [];

  // quebra por linhas, bullets, hífen, etc.
  const lines = raw
    .split(/\r?\n+/)
    .map((s) => s.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);

  if (lines.length >= 2) return lines.slice(0, max);

  // fallback: quebra por frases
  const sentences = raw
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length >= 2) return sentences.slice(0, max);

  return [raw];
}

function pickMissionTitle(topic: string) {
  const t = (topic || "").toLowerCase();
  if (t.includes("cor")) return "Cores em ação 🎨";
  if (t.includes("forma")) return "Formas mágicas 🔺";
  if (t.includes("animal")) return "Exploradores dos animais 🐾";
  if (t.includes("corpo")) return "Meu corpo, meu mundo 🧍";
  return "Missão do dia ✨";
}

export default async function StudentPage({
  params,
}: {
  params: Promise<{ teacherId: string; planId: string }>;
}) {
  const { teacherId, planId } = await params;
  const plan = await getPlan(teacherId, planId);

  const missionTitle = pickMissionTitle(plan.topic);
  const steps = toSteps(plan.activities, 6);

  const teacherHints = toSteps(plan.lessonPlan, 4);
  const accessibility = toSteps(plan.accessibility, 4);

  const progressTotal = Math.max(steps.length, 4);
  const progressDone = Math.min(1, progressTotal);
  const progressPct = Math.round((progressDone / progressTotal) * 100);

  return (
    <main className="min-h-screen text-white">
      <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(99,102,241,0.45),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(217,70,239,0.35),transparent_55%),linear-gradient(to_bottom,rgba(8,8,12,1),rgba(12,10,22,1))]">
        <div className="mx-auto max-w-4xl px-5 py-10">
          {/* Top card */}
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,.35)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80">
                  <Sparkles className="w-4 h-4" />
                  Inklue • modo aluno
                </div>

                <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
                  {missionTitle}
                </h1>

                <p className="mt-1 text-white/80">
                  Tema:{" "}
                  <span className="font-semibold text-white">{plan.topic}</span>
                </p>

                <p className="mt-2 text-xs text-white/50 font-mono">
                  {teacherId}/{planId}
                </p>
              </div>

              {/* “progress ring” simples */}
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 w-full md:w-[260px]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Progresso</p>
                  <span className="text-xs text-white/70">{progressPct}%</span>
                </div>

                <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-white/70"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/70">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                    <p className="text-white/50">Etapas</p>
                    <p className="font-semibold text-white">{progressTotal}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                    <p className="text-white/50">Hoje</p>
                    <p className="font-semibold text-white">1</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                    <p className="text-white/50">Conquistas</p>
                    <p className="font-semibold text-white">🏅</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Missões */}
          <div className="mt-6 grid gap-4">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,.25)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-white/70">Missão 1</p>
                  <h2 className="mt-1 text-xl font-extrabold flex items-center gap-2">
                    <Compass className="w-5 h-5 text-white/80" />
                    {missionTitle}
                  </h2>
                  <p className="mt-1 text-sm text-white/70">
                    Faça as etapas em ordem. Se não der pra completar tudo, tudo
                    bem — avance uma por vez.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80">
                  <PlayCircle className="w-4 h-4" />
                  Começar
                </div>
              </div>

              {/* Steps */}
              <div className="mt-5 grid gap-3">
                {(steps.length ? steps : ["Atividade em breve."]).map(
                  (s, idx) => (
                    <div
                      key={`${idx}-${s.slice(0, 12)}`}
                      className="group rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/5 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0">
                          <div className="w-10 h-10 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                            {idx === 0 ? (
                              <Flag className="w-5 h-5 text-white/80" />
                            ) : (
                              <CheckCircle2 className="w-5 h-5 text-white/50 group-hover:text-white/80 transition" />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-white/50">
                            Etapa {idx + 1}
                          </p>
                          <p className="mt-1 text-sm text-white/90 whitespace-pre-wrap">
                            {s}
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* Acessibilidade (“power-ups”) */}
              {accessibility.length > 0 && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-semibold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-white/80" />
                    Power-ups de acessibilidade
                  </p>

                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {accessibility.map((a, i) => (
                      <div
                        key={`acc-${i}`}
                        className="rounded-2xl border border-white/10 bg-white/5 p-3"
                      >
                        <p className="text-xs text-white/60 flex items-center gap-2">
                          {i % 3 === 0 ? (
                            <Eye className="w-4 h-4" />
                          ) : i % 3 === 1 ? (
                            <Volume2 className="w-4 h-4" />
                          ) : (
                            <Hand className="w-4 h-4" />
                          )}
                          Dica
                        </p>
                        <p className="mt-1 text-sm text-white/90 whitespace-pre-wrap">
                          {a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dicas do professor / roteiro */}
            {teacherHints.length > 0 && (
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,.25)]">
                <p className="font-semibold text-white/90">
                  Roteiro (para a sala)
                </p>
                <p className="mt-1 text-sm text-white/70">
                  Resumo do plano (pode aparecer pro professor ou mediador).
                </p>

                <div className="mt-4 grid gap-3">
                  {teacherHints.map((t, i) => (
                    <div
                      key={`hint-${i}`}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <p className="text-xs text-white/50">Nota {i + 1}</p>
                      <p className="mt-1 text-sm text-white/90 whitespace-pre-wrap">
                        {t}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 text-center text-white/50 text-xs">
            Inklue • feito para deixar a aula mais acessível
          </div>
        </div>
      </div>
    </main>
  );
}