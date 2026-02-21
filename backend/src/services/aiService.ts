import "dotenv/config";

type GenerateInput = {
  title: string;
  ageRange: string;
  classSize: number;
  topic: string;
  inclusionProfiles: string[];
  constraints?: string[];
  extractedMaterialsText?: string;
};

type GenerateOutput = {
  lessonPlan: string;
  activities: string;
  rubric: string;
  accessibility: string;
};

const AI_PROVIDER = (process.env.AI_PROVIDER || "groq").toLowerCase();

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_BASE_URL =
  process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";

function humanizeProfiles(profiles: string[]) {
  const map: Record<string, string> = {
    TEA_NON_VERBAL: "TEA (autismo) — não verbal",
    TEA_LEVEL_1: "TEA (autismo) — nível 1 (leve)",
    TEA_LEVEL_2: "TEA (autismo) — nível 2 (moderado)",
    TEA_LEVEL_3: "TEA (autismo) — nível 3 (alto suporte)",

    TDAH: "TDAH (déficit de atenção e hiperatividade)",
    DYSLEXIA: "Dislexia (dificuldade de leitura)",
    DYSCALCULIA: "Discalculia (dificuldade com números)",
    DYSGRAPHIA: "Disgrafia (dificuldade de escrita)",
    LANGUAGE_DELAY: "Atraso de fala/linguagem",
    APRAXIA_SPEECH: "Apraxia de fala",

    MOTOR_DIFFICULTY: "Dificuldade motora (coordenação fina/grossa)",
    HEARING_IMPAIRMENT: "Deficiência auditiva",
    VISUAL_IMPAIRMENT: "Deficiência visual",
    SENSORY_PROCESSING: "Processamento sensorial",

    INTELLECTUAL_DISABILITY: "Deficiência intelectual",
    DOWN_SYNDROME: "Síndrome de Down",
    ODD: "TOD/ODD — comportamento opositor",
    ANXIETY: "Ansiedade",
    CEREBRAL_PALSY: "Paralisia cerebral",
  };

  const unique = Array.from(
    new Set(profiles.map((p) => p.trim()).filter(Boolean)),
  );
  return unique.map((p) => map[p] ?? p);
}

function buildPrompt(input: GenerateInput) {
  const materials = input.extractedMaterialsText
    ? input.extractedMaterialsText.slice(0, 3500)
    : "Nenhum material anexado.";

  const profilesHuman = humanizeProfiles(input.inclusionProfiles);

  const constraintsText =
    (input.constraints ?? []).length > 0
      ? (input.constraints ?? []).join(", ")
      : "sem restrições informadas";

  return `
Você é um(a) assistente pedagógico(a) experiente da Educação Infantil (3 a 5 anos) no ensino público brasileiro.
Seu estilo deve ser: prático, detalhado, com linguagem clara para professor(a), e com base em DUA (Desenho Universal para a Aprendizagem).

Contexto:
- Título: ${input.title}
- Faixa etária: ${input.ageRange}
- Nº de alunos: ${input.classSize}
- Tema: ${input.topic}
- Perfis/necessidades (em linguagem humana): ${profilesHuman.join(" • ") || "Nenhum informado"}
- Restrições/realidade: ${constraintsText}

Materiais anexados (texto extraído):
"""
${materials}
"""

OBJETIVO:
Criar um plano de aula realmente aplicável (40–60 min), com roteiro, falas sugeridas, gestão de turma grande, e adaptações por perfil.

REGRAS IMPORTANTES:
- Use português natural (sem códigos).
- Pense em sala grande; proponha estações/rotatividade quando fizer sentido.
- Dê alternativas sem lápis, com imagens/gestos, rotina visual, alto contraste, comandos curtos.
- Inclua: acolhida/rotina, atividade principal, fechamento, avaliação formativa.
- Traga Plano B (barulho, falta de material, criança desregulada).

FORMATO DE SAÍDA:
Retorne APENAS um JSON válido (sem markdown, sem texto fora do JSON), com:
{
  "lessonPlan": "texto com seções e passos",
  "activities": "texto com atividades/estações numeradas e passo a passo",
  "rubric": "texto com checklist simples + níveis",
  "accessibility": "texto com adaptações por perfil + recursos visuais/CAA"
}

ESTRUTURA OBRIGATÓRIA dentro de lessonPlan (em texto):
1) Objetivos (3 bullets)
2) Habilidades/BNCC (descrever sem códigos)
3) Materiais (alternativas baratas)
4) Preparação do ambiente (layout, cantos/estações)
5) Roteiro minuto a minuto (com falas sugeridas)
6) Gestão de turma (combinados, sinais, transições)
7) Plano B

ESTRUTURA OBRIGATÓRIA dentro de activities:
- 3 a 5 atividades/estações
- Cada uma com: objetivo, duração, passo a passo, adaptação por perfil e variação rápida.

Agora gere o JSON completo.
`.trim();
}

function extractJson(text: string) {
  const t = String(text ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(t);
  } catch {}

  const firstBrace = t.indexOf("{");
  const lastBrace = t.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const sliced = t.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(sliced);
    } catch {}
  }

  const match = t.match(/\{[\s\S]*\}/);
  if (match?.[0]) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }

  throw new Error("Não consegui parsear JSON da resposta do modelo.");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableHttp(status?: number) {
  return status === 429 || status === 500 || status === 503 || status === 504;
}

async function withRetryFetch<T>(fn: () => Promise<T>, retries = 6) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      const status = e?.status;
      const isLast = attempt >= retries + 1;

      if (!isRetryableHttp(status) || isLast) {
        throw new Error(
          `[AI] falhou (http=${status ?? "-"} attempt=${attempt}/${retries + 1}). ${e?.message || String(err)}`,
        );
      }

      const base = 800;
      const wait = Math.min(8000, base * Math.pow(2, attempt - 1));
      const jitter = Math.floor(Math.random() * 300);
      await sleep(wait + jitter);
    }
  }
  throw new Error("[AI] retry esgotado.");
}

type GroqChatResponse = {
  choices?: Array<{
    message?: { content?: string };
    text?: string;
  }>;
};

async function generateWithGroq(input: GenerateInput): Promise<GenerateOutput> {
  if (!GROQ_API_KEY)
    throw new Error("GROQ_API_KEY não configurado no backend/.env");

  const prompt = buildPrompt(input);

  const body = {
    model: GROQ_MODEL,
    temperature: 0.2,
    max_tokens: 1600,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  };

  const url = `${GROQ_BASE_URL}/chat/completions`;

  const data = await withRetryFetch(async () => {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      const ex = new Error(txt || `HTTP ${resp.status}`) as Error & {
        status?: number;
      };
      ex.status = resp.status;
      throw ex;
    }

    return (await resp.json()) as GroqChatResponse;
  });

  const text =
    data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? "";

  if (!text) throw new Error("Resposta vazia do Groq.");

  const result = extractJson(text);

  return {
    lessonPlan: String(result.lessonPlan ?? ""),
    activities: String(result.activities ?? ""),
    rubric: String(result.rubric ?? ""),
    accessibility: String(result.accessibility ?? ""),
  };
}

export async function generateWithClaude(
  input: GenerateInput,
): Promise<GenerateOutput> {
  if (AI_PROVIDER === "groq") return generateWithGroq(input);

  throw new Error(
    "AI_PROVIDER não suportado/Bedrock desativado neste build. Use AI_PROVIDER=groq.",
  );
}
