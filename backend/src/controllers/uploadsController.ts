import { z } from "zod";
import type { Request, Response } from "express";
import { createPresignedUpload } from "../services/s3Service";

const schema = z.object({
  teacherId: z.string().min(1),
  contentType: z.string().min(3),
  originalName: z.string().min(1),
});

export async function presign(req: Request, res: Response) {
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Payload inválido",
      issues: parsed.error.issues,
    });
  }

  try {
    const out = await createPresignedUpload(parsed.data);
    return res.json(out);
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message ?? "Erro ao gerar presigned URL",
    });
  }
}
 