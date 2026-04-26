require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "sosconnect",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  max: 10,
  idleTimeoutMillis: 30000,
  ssl:
    process.env.DB_HOST && process.env.DB_HOST.includes("render.com")
      ? { rejectUnauthorized: false }
      : false,
});

pool.on("error", (err) => {
  console.error("❌ Pool error:", err.message);
});

module.exports = pool;
