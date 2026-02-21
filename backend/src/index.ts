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
