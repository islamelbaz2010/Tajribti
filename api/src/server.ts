import express from "express";
import cors from "cors";
import path from "path";
import consumerAuthRoutes from "./routes/consumerAuth";
import consumerRoutes from "./routes/consumer";
import companyAuthRoutes from "./routes/companyAuth";
import companyRoutes from "./routes/company";
import opsAuthRoutes from "./routes/opsAuth";
import opsRoutes from "./routes/ops";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "tajribti-benchmark-api" }));

app.use("/api/consumer/auth", consumerAuthRoutes);
app.use("/api/consumer", consumerRoutes);
app.use("/api/company/auth", companyAuthRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/ops/auth", opsAuthRoutes);
app.use("/api/ops", opsRoutes);

// Thin static web clients (Public / Consumer / Company / Operations),
// served from the same process for simplicity (no product decision).
const webRoot = path.join(__dirname, "..", "..", "web");
app.use("/app/consumer", express.static(path.join(webRoot, "app", "consumer")));
app.use("/app/company", express.static(path.join(webRoot, "app", "company")));
app.use("/app/ops", express.static(path.join(webRoot, "app", "ops")));
app.use("/", express.static(path.join(webRoot, "public")));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`TAJRIBTI Benchmark API listening on http://localhost:${PORT}`);
});
