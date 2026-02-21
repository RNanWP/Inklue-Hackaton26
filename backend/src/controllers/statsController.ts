import type { Request, Response } from "express";
import { listPlans } from "../services/databaseService";

export async function summary(req: Request, res: Response) {
  const q = req.query.teacherId;
  const first = Array.isArray(q) ? q[0] : q;
  const teacherId = typeof first === "string" ? first : "";

  if (!teacherId) {
    return res.status(400).json({ error: "teacherId é obrigatório" });
  }

  const items = await listPlans(teacherId);

  const total = items.length;
  const generated = items.filter((i) => i.status === "GENERATED").length;

  const byProfile: Record<string, number> = {};
  for (const p of items) {
    for (const prof of p.inclusionProfiles) {
      byProfile[prof] = (byProfile[prof] || 0) + 1;
    }
  }

  return res.json({
    totalPlans: total,
    generatedPlans: generated,
    draftPlans: total - generated,
    byProfile,
  });
}
