import "dotenv/config";
import express from "express";
import cors from "cors";
import { routes } from "./routes";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api", routes);

const port = Number(process.env.PORT || 3333);
app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});

app.use("/api", routes);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("API Error:", err);

  // Zod
  if (err?.name === "ZodError") {
    return res
      .status(400)
      .json({ error: "ValidationError", issues: err.issues });
  }

  return res.status(500).json({ error: "InternalServerError" });
});
