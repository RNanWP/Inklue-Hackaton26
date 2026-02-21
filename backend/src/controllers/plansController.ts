import { z } from "zod";
import type { Request, Response } from "express";
import {
  createPlan,
  listPlans,
  getPlan,
  deletePlan,
  saveGeneratedContent,
} from "../services/databaseService";
import { generateWithClaude } from "../services/aiService";
import { makeQrDataUrl } from "../services/qrService";

const createSchema = z.object({
  teacherId: z.string().min(1),
  title: z.string().min(3),
  ageRange: z.string().min(1),
  classSize: z.number().int().min(1).max(60),
  topic: z.string().min(2),
  inclusionProfiles: z.array(z.string()).default([]),
  constraints: z.array(z.string()).optional(),
});

const paramsSchema = z.object({
  teacherId: z.string().min(1),
  planId: z.string().min(1),
});

export async function create(req: Request, res: Response) {
  const input = createSchema.parse(req.body);
  const payload = {
    teacherId: input.teacherId,
    title: input.title,
    ageRange: input.ageRange,
    classSize: input.classSize,
    topic: input.topic,
    inclusionProfiles: input.inclusionProfiles,
    ...(input.constraints ? { constraints: input.constraints } : {}),
  };

  const item = await createPlan(payload);

  return res.status(201).json(item);
}

export async function list(req: Request, res: Response) {
  const q = req.query.teacherId;
  const first = Array.isArray(q) ? q[0] : q;
  const teacherId = typeof first === "string" ? first : "";

  if (!teacherId)
    return res.status(400).json({ error: "teacherId é obrigatório" });

  const items = await listPlans(teacherId);
  return res.json(items);
}

export async function getOne(req: Request, res: Response) {
  const { teacherId, planId } = paramsSchema.parse(req.params);

  const item = await getPlan(teacherId, planId);
  if (!item) return res.status(404).json({ error: "Plano não encontrado" });
  return res.json(item);
}

export async function remove(req: Request, res: Response) {
  const { teacherId, planId } = paramsSchema.parse(req.params);

  const out = await deletePlan(teacherId, planId);
  return res.json(out);
}

export async function generate(req: Request, res: Response) {
  const { teacherId, planId } = paramsSchema.parse(req.params);

  const plan = await getPlan(teacherId, planId);
  if (!plan) return res.status(404).json({ error: "Plano não encontrado" });

  const aiPayload = {
    title: plan.title,
    ageRange: plan.ageRange,
    classSize: plan.classSize,
    topic: plan.topic,
    inclusionProfiles: plan.inclusionProfiles,
    constraints: plan.constraints ?? [],
    ...(plan.extractedMaterialsText
      ? { extractedMaterialsText: plan.extractedMaterialsText }
      : {}),
  };

  const generated = await generateWithClaude(aiPayload);

  const saved = await saveGeneratedContent(teacherId, planId, generated);

  const base = process.env.PUBLIC_BASE_URL || "http://localhost:3000";
  const studentUrl = `${base}/s/${teacherId}/${planId}`;
  const qr = await makeQrDataUrl(studentUrl);

  return res.json({ ...saved, studentUrl, qrDataUrl: qr });
}
