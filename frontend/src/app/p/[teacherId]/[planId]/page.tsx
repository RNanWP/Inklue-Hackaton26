import Link from "next/link";

type Plan = {
  teacherId: string;
  planId: string;

  title: string;
  topic: string;
  ageRange: string;
  classSize: number;
  inclusionProfiles: string[];
  constraints: string[];

  lessonPlan?: string;
  activities?: string;
  rubric?: string;
  accessibility?: string;

  createdAt?: string;
  updatedAt?: string;
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

function splitBlocks(text?: string) {
  const raw = (text ?? "").trim();
  if (!raw) return [];
  return raw
    .split(/\n{2,}/g)
    .map((b) => b.trim())
    .filter(Boolean);
}

function LineText({ text }: { text?: string }) {
  const blocks = splitBlocks(text);
  if (!blocks.length) return <p className="text-white/60">—</p>;
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => (
        <p
          key={i}
          className="whitespace-pre-wrap text-white/90 leading-relaxed"
        >
          {b}
        </p>
      ))}
    </div>
  );
}

export default async function PlanReadablePage({
  params,
}: {
  params: Promise<{ teacherId: string; planId: string }>;
}) {
  const { teacherId, planId } = await params;
  const plan = await getPlan(teacherId, planId);

  const apiBase = process.env.NEXT_PUBLIC_API_URL!;
  const pdfUrl = `${apiBase}/plans/${teacherId}/${planId}/pdf`;

  return (
    <main className="min-h-screen text-white">
      <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(99,102,241,0.35),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(217,70,239,0.25),transparent_55%),linear-gradient(to_bottom,rgba(8,8,12,1),rgba(12,10,22,1))]">
        <div className="mx-auto max-w-4xl px-5 py-10 space-y-5">
          {/* Header */}
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,.35)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="text-xs text-white/60 font-mono">
                  {teacherId}/{planId}
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  {plan.title || "Plano"}
                </h1>
                <p className="text-white/80">
                  <span className="text-white/60">Tema:</span>{" "}
                  <span className="font-semibold">{plan.topic}</span>
                </p>

                <div className="flex flex-wrap gap-2 text-sm text-white/70">
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                    Faixa:{" "}
                    <span className="text-white/90">{plan.ageRange}</span>
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                    Turma:{" "}
                    <span className="text-white/90">{plan.classSize}</span>
                  </span>
                  {!!plan.inclusionProfiles?.length && (
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                      Perfis:{" "}
                      <span className="text-white/90">
                        {plan.inclusionProfiles.join(", ")}
                      </span>
                    </span>
                  )}
                </div>

                {!!plan.constraints?.length && (
                  <div className="mt-2">
                    <p className="text-sm text-white/60 mb-1">
                      Contexto/Restrições
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {plan.constraints.map((c, i) => (
                        <span
                          key={i}
                          className="text-xs rounded-full border border-white/10 bg-black/20 px-3 py-1 text-white/80"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/s/${teacherId}/${planId}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
                >
                  Modo aluno
                </Link>

                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
                  title="Abrir PDF (imprimir/salvar)"
                >
                  Abrir PDF
                </a>

                <a
                  href={pdfUrl}
                  download={`plano-${planId}.pdf`}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
                  title="Baixar PDF"
                >
                  Baixar PDF
                </a>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="grid gap-4">
            <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,.25)]">
              <h2 className="text-xl font-extrabold mb-3">Plano de aula</h2>
              <LineText text={plan.lessonPlan} />
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,.25)]">
              <h2 className="text-xl font-extrabold mb-3">
                Atividades / Estações
              </h2>
              <LineText text={plan.activities} />
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,.25)]">
              <h2 className="text-xl font-extrabold mb-3">Acessibilidade</h2>
              <LineText text={plan.accessibility} />
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,.25)]">
              <h2 className="text-xl font-extrabold mb-3">
                Rubrica / Observação
              </h2>
              <LineText text={plan.rubric} />
            </section>
          </div>

          <div className="text-center text-white/50 text-xs pt-6">
            Inklue • Página legível do plano (modo professor)
          </div>
        </div>
      </div>
    </main>
  );
}
