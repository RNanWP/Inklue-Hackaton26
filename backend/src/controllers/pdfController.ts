import type { Request, Response } from "express";
import { z } from "zod";
import { getPlan } from "../services/databaseService";
import { createPlanPdfBuffer, type PdfInput } from "../services/pdfService";

const paramsSchema = z.object({
  teacherId: z.string().min(1),
  planId: z.string().min(1),
});

export async function createPdf(req: Request, res: Response) {
  const { teacherId, planId } = paramsSchema.parse(req.params);

  const plan = await getPlan(teacherId, planId);
  if (!plan) return res.status(404).json({ error: "Plano não encontrado" });

  const input: PdfInput = {
    teacherId,
    planId,
    title: plan.title,
    topic: plan.topic,
    ageRange: plan.ageRange,
    classSize: plan.classSize,
    inclusionProfiles: plan.inclusionProfiles ?? [],
    constraints: plan.constraints ?? [],

    lessonPlan: plan.lessonPlan ?? "",
    activities: plan.activities ?? "",
    accessibility: plan.accessibility ?? "",
    rubric: plan.rubric ?? "",
  };

  const pdf = await createPlanPdfBuffer(input);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="plano-${planId}.pdf"`,
  );
  return res.status(200).send(pdf);
}

export async function getPdf(req: Request, res: Response) {
  return createPdf(req, res);
}
