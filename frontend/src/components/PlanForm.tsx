"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { TEACHER_ID } from "@/lib/constants";
import { VoiceInput } from "@/components/VoiceInput";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Badge,
  Input,
} from "@/components/ui";
import {
  Sparkles,
  X,
  Search,
  Users,
  BookOpen,
  SlidersHorizontal,
  CheckCircle2,
  Wand2,
  FileUp,
  Eye,
} from "lucide-react";

type AttachmentUI = {
  key: string;
  originalName: string;
  contentType: string;
  status: "UPLOADED" | "PROCESSING" | "DONE" | "FAILED";
};

type GeneratedPayload = {
  lessonPlan: string;
  activities: unknown;
  rubric?: string;
  accessibility?: string;
  studentUrl?: string;
  qrDataUrl?: string;
};

type ProfileItem = {
  code: string;
  label: string;
  hint?: string;
  category: string;
};

const PROFILE_CATALOG: ProfileItem[] = [
  // Autismo (TEA)
  {
    category: "Autismo (TEA)",
    code: "TEA_LEVEL_1",
    label: "TEA — Nível 1 (suporte leve)",
    hint: "Rotina previsível, instruções curtas, ajustes leves.",
  },
  {
    category: "Autismo (TEA)",
    code: "TEA_LEVEL_2",
    label: "TEA — Nível 2 (suporte moderado)",
    hint: "Mais mediação, pistas visuais, apoio frequente.",
  },
  {
    category: "Autismo (TEA)",
    code: "TEA_LEVEL_3",
    label: "TEA — Nível 3 (suporte intenso)",
    hint: "Estrutura alta, mediação constante, ambiente previsível.",
  },
  {
    category: "Autismo (TEA)",
    code: "TEA_NON_VERBAL",
    label: "TEA — Comunicação não verbal (alternativas)",
    hint: "PECS/figuras/gestos; respostas por apontar/selecionar.",
  },

  // Atenção/Comportamento
  {
    category: "Atenção / Comportamento",
    code: "TDAH",
    label: "TDAH — atenção e hiperatividade",
    hint: "Rotina curta, papéis de ajudante, pausas ativas.",
  },
  {
    category: "Atenção / Comportamento",
    code: "ODD",
    label: "TOD/ODD — comportamento opositor",
    hint: "Escolhas controladas, combinados visuais, reforço positivo.",
  },
  {
    category: "Atenção / Comportamento",
    code: "ANXIETY",
    label: "Ansiedade (crianças) — previsibilidade",
    hint: "Antecipação visual, transições suaves, ambiente calmo.",
  },

  // Aprendizagem
  {
    category: "Aprendizagem",
    code: "DYSLEXIA",
    label: "Dislexia — dificuldade em leitura/sons",
    hint: "Atividades multissensoriais, rimas, oralidade, imagens.",
  },
  {
    category: "Aprendizagem",
    code: "DYSCALCULIA",
    label: "Discalculia — dificuldade com números",
    hint: "Concreto/visual, contagem com objetos, jogos simples.",
  },
  {
    category: "Aprendizagem",
    code: "DYSGRAPHIA",
    label: "Disgrafia — escrita/motricidade fina",
    hint: "Menos lápis, mais recorte/encaixe/colagem/traçados grandes.",
  },

  // Linguagem/Comunicação
  {
    category: "Linguagem / Comunicação",
    code: "LANGUAGE_DELAY",
    label: "Atraso de fala/linguagem",
    hint: "Modelagem de fala, frases curtas, apoio visual.",
  },
  {
    category: "Linguagem / Comunicação",
    code: "APRAXIA_SPEECH",
    label: "Apraxia de fala",
    hint: "Rotina de repetição leve, pistas visuais, sem pressão.",
  },

  // Sensorial
  {
    category: "Sensorial",
    code: "SENSORY_PROCESSING",
    label: "Processamento sensorial",
    hint: "Cantinho calmo, reduzir ruído, materiais táteis graduais.",
  },
  {
    category: "Sensorial",
    code: "HEARING_IMPAIRMENT",
    label: "Deficiência auditiva",
    hint: "Visual forte, gestos, posição frontal, comandos curtos.",
  },
  {
    category: "Sensorial",
    code: "VISUAL_IMPAIRMENT",
    label: "Deficiência visual",
    hint: "Contraste alto, tamanho grande, textura/sons.",
  },

  // Motora/Física
  {
    category: "Motora / Física",
    code: "MOTOR_DIFFICULTY",
    label: "Dificuldade motora (coordenação / motricidade fina)",
    hint: "Sem lápis; encaixe, apontar, colagem, peças grandes.",
  },
  {
    category: "Motora / Física",
    code: "CEREBRAL_PALSY",
    label: "Paralisia cerebral (adaptações motoras)",
    hint: "Materiais maiores, apoio postural, tempo extra.",
  },

  // Intelectual/Genética
  {
    category: "Intelectual / Genética",
    code: "INTELLECTUAL_DISABILITY",
    label: "Deficiência intelectual (leve/moderada)",
    hint: "Passos curtos, repetição, visual, reforço positivo.",
  },
  {
    category: "Intelectual / Genética",
    code: "DOWN_SYNDROME",
    label: "Síndrome de Down",
    hint: "Rotina, linguagem simples, repetição e apoio visual.",
  },
];

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

function groupByCategory(items: ProfileItem[]) {
  const map = new Map<string, ProfileItem[]>();
  for (const it of items) {
    const list = map.get(it.category) ?? [];
    list.push(it);
    map.set(it.category, list);
  }
  return Array.from(map.entries());
}

export function PlanForm() {
  const [title, setTitle] = useState("Aula inclusiva");
  const [ageRange, setAgeRange] = useState("3-5");
  const [classSize, setClassSize] = useState(20);
  const [topic, setTopic] = useState("cores e formas");

  const [profiles, setProfiles] = useState<string[]>(["TEA_LEVEL_3"]);

  const [constraints, setConstraints] = useState<string[]>([]);

  const [planId, setPlanId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentUI[]>([]);
  const [generated, setGenerated] = useState<GeneratedPayload | null>(null);
  const [busy, setBusy] = useState(false);


  const [profilesOpen, setProfilesOpen] = useState(false);
  const [profileQuery, setProfileQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Autismo (TEA)");

  const profilesLabel = useMemo(() => {
    const labels = profiles
      .map(
        (code) => PROFILE_CATALOG.find((p) => p.code === code)?.label ?? code,
      )
      .slice(0, 3);
    const rest = profiles.length - labels.length;
    return profiles.length === 0
      ? "nenhum"
      : rest > 0
        ? `${labels.join(", ")} +${rest}`
        : labels.join(", ");
  }, [profiles]);

  const studentPath = planId ? `/s/${TEACHER_ID}/${planId}` : "";

  function addConstraint(text: string) {
    const cleaned = text.trim();
    if (!cleaned) return;
    setConstraints((prev) => uniq([...prev, cleaned]));
  }

  function removeConstraint(idx: number) {
    setConstraints((prev) => prev.filter((_, i) => i !== idx));
  }

  function applyVoice(text: string) {
    addConstraint(text);
  }

  function toggleProfile(code: string) {
    setProfiles((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code],
    );
  }

  function clearProfiles() {
    setProfiles([]);
  }

  async function createPlan(): Promise<string> {
    const res = await api.post("/plans", {
      teacherId: TEACHER_ID,
      title,
      ageRange,
      classSize,
      topic,
      inclusionProfiles: profiles,
      constraints,
    });

    const newPlanId = String(res.data.planId);
    setPlanId(newPlanId);
    setGenerated(null);
    setAttachments([]);
    return newPlanId;
  }

  async function generateAI(targetPlanId: string) {
    const res = await api.post(`/plans/${TEACHER_ID}/${targetPlanId}/generate`);
    const payload = res.data as GeneratedPayload;

    setGenerated({
      ...payload,
      lessonPlan: String(payload.lessonPlan ?? ""),
      rubric: String(payload.rubric ?? ""),
      accessibility: String(payload.accessibility ?? ""),
      activities: payload.activities ?? "",
    });

    window.open(`/p/${TEACHER_ID}/${targetPlanId}`, "_blank");
  }

  async function createAndGenerate() {
    setBusy(true);
    try {
      const id = planId ?? (await createPlan());
      await generateAI(id);
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateOnly() {
    setBusy(true);
    try {
      await createPlan();
    } finally {
      setBusy(false);
    }
  }

  async function presignAndUploadMany(files: FileList | null) {
    if (!files || !planId) return;
    const fileArr = Array.from(files);

    for (const file of fileArr) {
      const contentType = file.type || "application/octet-stream";

      const presign = await api.post("/uploads/presign", {
        teacherId: TEACHER_ID,
        contentType,
        originalName: file.name,
      });

      const { uploadUrl, key } = presign.data as {
        uploadUrl: string;
        key: string;
      };

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });

      await api.post("/attachments", {
        teacherId: TEACHER_ID,
        planId,
        key,
        originalName: file.name,
        contentType,
      });

      await api.post("/attachments/process", {
        teacherId: TEACHER_ID,
        planId,
        key,
        contentType,
      });

      setAttachments((prev) => [
        { key, originalName: file.name, contentType, status: "PROCESSING" },
        ...prev,
      ]);
      pollStatus(planId, key);
    }
  }

  function pollStatus(currentPlanId: string, key: string) {
    const tick = async () => {
      const res = await api.get("/attachments/status", {
        params: { teacherId: TEACHER_ID, planId: currentPlanId, key },
      });

      const st = res.data?.status as AttachmentUI["status"] | undefined;
      if (!st) return;

      setAttachments((prev) =>
        prev.map((a) => (a.key === key ? { ...a, status: st } : a)),
      );
      if (st === "PROCESSING") setTimeout(tick, 2000);
    };

    setTimeout(tick, 1200);
  }

  const grouped = useMemo(() => groupByCategory(PROFILE_CATALOG), []);
  const categories = grouped.map(([cat]) => cat);

  const filteredList = useMemo(() => {
    const q = profileQuery.trim().toLowerCase();
    const items = PROFILE_CATALOG.filter((p) => p.category === activeCategory);
    if (!q) return items;
    return items.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        (p.hint ?? "").toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q),
    );
  }, [profileQuery, activeCategory]);

  return (
    <div className="space-y-5 pb-24 md:pb-10">
      {/* FORM */}
      <Card className="border border-white/10 bg-white/5">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 opacity-80" />
                  Criar plano
                </p>
                <p className="text-sm text-white/60">
                  Perfis:{" "}
                  <span className="font-medium text-white">
                    {profilesLabel}
                  </span>
                </p>
                {planId && (
                  <p className="text-xs text-white/50">
                    ID: <span className="font-mono">{planId}</span>
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setProfilesOpen(true)}
                className="shrink-0"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Perfis
              </Button>
            </div>

            {/* Selecionar perfis */}
            <div className="flex flex-wrap gap-2">
              {profiles.length === 0 ? (
                <Badge tone="yellow">Selecione 1 ou mais perfis</Badge>
              ) : (
                profiles.map((code) => {
                  const label =
                    PROFILE_CATALOG.find((p) => p.code === code)?.label ?? code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggleProfile(code)}
                      className="cursor-pointer"
                      title="Toque para remover"
                    >
                      <Badge tone="blue">{label}</Badge>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 opacity-70" />
                Título
              </span>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Aula inclusiva"
              />
            </label>

            <label className="space-y-1 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 opacity-70" />
                Tema
              </span>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: cores e formas"
              />
            </label>

            <label className="space-y-1 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 opacity-70" />
                Faixa etária
              </span>
              <Input
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                placeholder="3-5"
              />
            </label>

            <label className="space-y-1 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 opacity-70" />
                Tamanho da turma
              </span>
              <Input
                type="number"
                value={classSize}
                onChange={(e) => setClassSize(Number(e.target.value))}
                placeholder="20"
              />
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {constraints.length === 0 ? (
                <Badge tone="yellow">Sem contexto ainda</Badge>
              ) : (
                constraints.map((c, i) => (
                  <button
                    key={`${c}-${i}`}
                    type="button"
                    onClick={() => removeConstraint(i)}
                    className="cursor-pointer"
                    title="Toque para remover"
                  >
                    <Badge tone="blue">{c.slice(0, 70)}</Badge>
                  </button>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VOICE */}
      <Card className="border border-white/10 bg-white/5">
        <CardContent className="p-4 md:p-5">
          <VoiceInput
            onApplyText={(text) => applyVoice(text)}
            hintExamples={[
              "João tem dificuldade de coordenação motora fina",
              "Quero uma atividade sem lápis e com figuras",
              "Preciso de rotina visual e instruções curtas",
            ]}
          />
          <div className="mt-3 flex items-start gap-2 text-xs text-white/55">
            <Sparkles className="h-4 w-4 mt-0.5 opacity-80" />
            <p>
              Dica: fale o contexto e limitações (ex.: “sala barulhenta”, “sem
              impressora”). Isso vira “Contexto” do plano.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ANEXOS */}
      <Card className="border border-white/10 bg-white/5">
        <CardContent className="p-4 md:p-5 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="font-semibold">Anexos (PDF / Imagem)</p>
            <p className="text-sm text-white/60">
              Enriquece o prompt com texto extraído.
            </p>
          </div>

          <label className="inline-flex">
            <input
              className="hidden"
              type="file"
              multiple
              accept="application/pdf,image/*"
              onChange={(e) => presignAndUploadMany(e.target.files)}
              disabled={!planId || busy}
            />
            <Button type="button" variant="ghost" disabled={!planId || busy}>
              <FileUp className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </label>
        </CardContent>
      </Card>

      {/* PROCESSAMENTO */}
      {attachments.length > 0 && (
        <Card className="border border-white/10 bg-white/5">
          <CardContent className="p-4 md:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Processamento</p>
              <Badge tone="yellow">Status</Badge>
            </div>

            <div className="space-y-2">
              {attachments.map((a) => (
                <div
                  key={a.key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{a.originalName}</p>
                    <p className="text-xs text-white/50 truncate">{a.key}</p>
                  </div>

                  <Badge
                    tone={
                      a.status === "DONE"
                        ? "green"
                        : a.status === "FAILED"
                          ? "pink"
                          : "yellow"
                    }
                  >
                    {a.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* RESULTADO */}
      {generated && (
        <Card className="border border-white/10 bg-white/5">
          <CardContent className="p-4 md:p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold">
                Resultado da IA (editável)
              </p>
              <Badge tone="green">Gerado</Badge>
            </div>

            {generated.studentUrl && (
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="font-semibold">Link do aluno</p>
                <p className="mt-1 text-sm text-white/70 break-all">
                  {generated.studentUrl}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-2">
              <p className="font-semibold">Plano de aula</p>
              <textarea
                className="w-full min-h-[170px] rounded-xl bg-black/30 border border-white/10 p-3 text-sm text-white/90 outline-none"
                value={generated.lessonPlan}
                onChange={(e) =>
                  setGenerated((prev) =>
                    prev ? { ...prev, lessonPlan: e.target.value } : prev,
                  )
                }
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-2">
              <p className="font-semibold">Atividades (raw)</p>
              <textarea
                className="w-full min-h-[150px] rounded-xl bg-black/30 border border-white/10 p-3 text-sm text-white/90 outline-none"
                value={
                  typeof generated.activities === "string"
                    ? generated.activities
                    : JSON.stringify(generated.activities, null, 2)
                }
                onChange={(e) =>
                  setGenerated((prev) =>
                    prev ? { ...prev, activities: e.target.value } : prev,
                  )
                }
              />
              <p className="text-xs text-white/50">
                Observação: o modo aluno renderiza em “missões/etapas”, mesmo
                que aqui esteja em JSON.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-2">
              <p className="font-semibold">Acessibilidade</p>
              <textarea
                className="w-full min-h-[130px] rounded-xl bg-black/30 border border-white/10 p-3 text-sm text-white/90 outline-none"
                value={generated.accessibility ?? ""}
                onChange={(e) =>
                  setGenerated((prev) =>
                    prev ? { ...prev, accessibility: e.target.value } : prev,
                  )
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* STICKY ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-2">
          <Button
            type="button"
            onClick={handleCreateOnly}
            disabled={busy}
            className="flex-1"
          >
            {planId ? (
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Criado
              </span>
            ) : (
              "Criar plano"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={createAndGenerate}
            disabled={busy}
            className="flex-1"
          >
            <span className="inline-flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              {busy ? "Gerando..." : "Gerar IA"}
            </span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={!planId}
            onClick={() => planId && window.open(studentPath, "_blank")}
            className="px-3"
            title="Ver modo aluno"
          >
            <Eye className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* PROFILES SHEET */}
      {profilesOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setProfilesOpen(false)}
            aria-label="Fechar"
          />
          <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-3xl rounded-t-3xl border border-white/10 bg-[#0b0b10]/95 backdrop-blur-xl shadow-[0_-20px_60px_rgba(0,0,0,.6)]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="font-semibold">Perfis de inclusão</p>
                <p className="text-xs text-white/50">
                  Selecione 1 ou mais — enviamos o “code” pro backend.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={clearProfiles}>
                  Limpar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setProfilesOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Fechar
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <Search className="h-4 w-4 opacity-70" />
                <input
                  value={profileQuery}
                  onChange={(e) => setProfileQuery(e.target.value)}
                  placeholder="Buscar perfil..."
                  className="w-full bg-transparent text-sm outline-none text-white/90 placeholder:text-white/40"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={[
                      "shrink-0 rounded-full border px-3 py-1 text-sm",
                      cat === activeCategory
                        ? "border-white/20 bg-white/15 text-white"
                        : "border-white/10 bg-white/5 text-white/70",
                    ].join(" ")}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-[55vh] overflow-auto pr-1">
                {filteredList.map((p) => {
                  const selected = profiles.includes(p.code);
                  return (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => toggleProfile(p.code)}
                      className={[
                        "w-full text-left rounded-2xl border p-4 transition",
                        selected
                          ? "border-white/20 bg-white/10"
                          : "border-white/10 bg-white/5 hover:bg-white/7",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{p.label}</p>
                          {p.hint && (
                            <p className="mt-1 text-xs text-white/60">
                              {p.hint}
                            </p>
                          )}
                          <p className="mt-2 text-[11px] text-white/40 font-mono">
                            code: {p.code}
                          </p>
                        </div>
                        <span
                          className={[
                            "text-xs rounded-full px-2 py-1 border",
                            selected
                              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                              : "border-white/10 text-white/60",
                          ].join(" ")}
                        >
                          {selected ? "Selecionado" : "Adicionar"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-white/60">Selecionados:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profiles.length === 0 ? (
                    <Badge tone="yellow">Nenhum</Badge>
                  ) : (
                    profiles.map((code) => {
                      const label =
                        PROFILE_CATALOG.find((p) => p.code === code)?.label ??
                        code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => toggleProfile(code)}
                        >
                          <Badge tone="blue">{label}</Badge>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
