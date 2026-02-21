import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type PdfInput = {
  teacherId: string;
  planId: string;
  title: string;
  topic: string;
  ageRange: string;
  classSize: number;
  inclusionProfiles: string[];
  constraints: string[];

  lessonPlan: string;
  activities: string;
  accessibility: string;
  rubric: string;
};

function wrapLines(text: string, maxLen = 95) {
  const words = (text || "").replace(/\r/g, "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxLen) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawSection(
  page: any,
  font: any,
  title: string,
  body: string,
  startY: number,
) {
  let y = startY;

  page.drawText(title, {
    x: 50,
    y,
    size: 14,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  y -= 18;

  const lines = wrapLines(body, 105);
  for (const ln of lines) {
    if (y < 60) return { y, overflow: true };
    page.drawText(ln, { x: 50, y, size: 10.5, font, color: rgb(0, 0, 0) });
    y -= 14;
  }

  y -= 10;
  return { y, overflow: false };
}

export async function createPlanPdfBuffer(input: PdfInput): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 800;

  // Header
  page.drawText("Inklue — Plano de Aula", {
    x: 50,
    y,
    size: 18,
    font: fontBold,
    color: rgb(0.12, 0.12, 0.12),
  });
  y -= 22;

  page.drawText(`Título: ${input.title}`, { x: 50, y, size: 11, font });
  y -= 14;
  page.drawText(`Tema: ${input.topic}`, { x: 50, y, size: 11, font });
  y -= 14;
  page.drawText(`Faixa etária: ${input.ageRange} • Turma: ${input.classSize}`, {
    x: 50,
    y,
    size: 11,
    font,
  });
  y -= 14;

  page.drawText(`Perfis: ${input.inclusionProfiles.join(", ") || "-"}`, {
    x: 50,
    y,
    size: 10.5,
    font,
  });
  y -= 14;

  page.drawText(`Contexto: ${input.constraints.join(" • ") || "-"}`, {
    x: 50,
    y,
    size: 10.5,
    font,
  });
  y -= 18;

  // Sections
  const sections: Array<{ t: string; b: string }> = [
    { t: "Plano de aula", b: input.lessonPlan },
    { t: "Atividades", b: input.activities },
    { t: "Acessibilidade", b: input.accessibility },
    { t: "Rubrica (avaliação)", b: input.rubric },
  ];

  for (const s of sections) {
    const out = drawSection(page, fontBold, s.t, s.b, y);
    y = out.y;

    if (out.overflow) {
      page = pdf.addPage([595.28, 841.89]);
      y = 800;
      const out2 = drawSection(page, fontBold, s.t, s.b, y);
      y = out2.y;
    }
  }

  // Footer
  page.drawText(`ID: ${input.teacherId}/${input.planId}`, {
    x: 50,
    y: 30,
    size: 9,
    font,
    color: rgb(0.35, 0.35, 0.35),
  });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
