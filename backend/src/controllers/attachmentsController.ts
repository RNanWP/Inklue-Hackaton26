import type { Request, Response } from "express";
import { z } from "zod";
import {
  addAttachment,
  updateAttachment,
  refreshExtractedMaterialsText,
  getPlan,
} from "../services/databaseService";
import {
  startTextractForS3Object,
  pollTextractJob,
} from "../services/textractService";

const addSchema = z.object({
  teacherId: z.string().min(1),
  planId: z.string().min(1),
  key: z.string().min(1),
  originalName: z.string().min(1),
  contentType: z.string().min(3),
});

export async function attach(req: Request, res: Response) {
  const input = addSchema.parse(req.body);

  const updated = await addAttachment(input.teacherId, input.planId, {
    key: input.key,
    originalName: input.originalName,
    contentType: input.contentType,
    status: "UPLOADED",
  });

  return res.json(updated);
}

const processSchema = z.object({
  teacherId: z.string().min(1),
  planId: z.string().min(1),
  key: z.string().min(1),
  contentType: z.string().min(3),
});

export async function process(req: Request, res: Response) {
  const input = processSchema.parse(req.body);

  await updateAttachment(input.teacherId, input.planId, input.key, {
    status: "PROCESSING",
  });

  const out = await startTextractForS3Object({
    key: input.key,
    contentType: input.contentType,
  });

  if (out.mode === "SYNC_IMAGE") {
    await updateAttachment(input.teacherId, input.planId, input.key, {
      status: "DONE",
      extractedText: out.text.slice(0, 12000),
    });
    await refreshExtractedMaterialsText(input.teacherId, input.planId);
    return res.json({ status: "DONE" });
  }

  await updateAttachment(input.teacherId, input.planId, input.key, {
    textractJobId: out.jobId,
    status: "PROCESSING",
  });

  return res.json({ status: "PROCESSING", jobId: out.jobId });
}

const statusSchema = z.object({
  teacherId: z.string().min(1),
  planId: z.string().min(1),
  key: z.string().min(1),
});

export async function status(req: Request, res: Response) {
  const input = statusSchema.parse(req.query);

  const plan = await getPlan(input.teacherId, input.planId);
  if (!plan) return res.status(404).json({ error: "Plano não encontrado" });

  const att = (plan.attachments ?? []).find((a) => a.key === input.key);
  if (!att) return res.status(404).json({ error: "Anexo não encontrado" });

  if (!att.textractJobId) return res.json({ status: att.status });

  const polled = await pollTextractJob(att.textractJobId);

  if (polled.status === "DONE") {
    await updateAttachment(input.teacherId, input.planId, input.key, {
      status: "DONE",
      extractedText: polled.text.slice(0, 12000),
    });
    await refreshExtractedMaterialsText(input.teacherId, input.planId);
  }

  if (polled.status === "FAILED") {
    await updateAttachment(input.teacherId, input.planId, input.key, {
      status: "FAILED",
      error: polled.error,
    });
  }

  return res.json(polled);
}
