require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(
    `${new Date().toISOString().slice(11, 19)} ${req.method} ${req.path}`,
  );
  next();
});

// ── Routes ─────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch {
    res.status(503).json({ ok: false, db: "disconnected" });
  }
});

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Bem-vindo à API do SOSconnect! O sistema está funcionando.",
  });
});

app.use((_req, res) =>
  res.status(404).json({ ok: false, message: "Rota não encontrada" }),
);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, message: "Erro interno" });
});

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌊 SOSconnect API → http://localhost:${PORT}\n`);
});
