import { Router } from "express";

import * as plans from "./controllers/plansController";
import * as stats from "./controllers/statsController";
import * as uploads from "./controllers/uploadsController";
import * as attachments from "./controllers/attachmentsController";
import * as pdf from "./controllers/pdfController";

export const routes = Router();

// health
routes.get("/health", (_req, res) => res.json({ ok: true }));

// plans CRUD
routes.post("/plans", plans.create);
routes.get("/plans", plans.list);
routes.get("/plans/:teacherId/:planId", plans.getOne);
routes.delete("/plans/:teacherId/:planId", plans.remove);

// generate AI
routes.post("/plans/:teacherId/:planId/generate", plans.generate);

// uploads / attachments
routes.post("/uploads/presign", uploads.presign);
routes.post("/attachments", attachments.attach);
routes.post("/attachments/process", attachments.process);
routes.get("/attachments/status", attachments.status);

// PDF
routes.post("/plans/:teacherId/:planId/pdf", pdf.createPdf);
routes.get("/plans/:teacherId/:planId/pdf", pdf.createPdf);

// stats
routes.get("/stats/summary", stats.summary);
