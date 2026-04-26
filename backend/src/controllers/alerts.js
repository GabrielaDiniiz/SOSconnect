const { validationResult } = require("express-validator");
const db = require("../config/db");

const handleError = (res, err) => {
  console.error(err.message);
  res.status(500).json({ ok: false, message: "Erro interno do servidor" });
};

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ ok: false, errors: errors.array() });
    return false;
  }
  return true;
};

exports.list = async (req, res) => {
  try {
    const { status, severity, limit = 50, offset = 0 } = req.query;
    const conditions = [];
    const params = [];

    if (status) { conditions.push(`status = $${params.push(status)}`); }
    if (severity) { conditions.push(`severity = $${params.push(severity)}`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    params.push(Number(limit), Number(offset));

    const { rows } = await db.query(
      `SELECT * FROM alerts ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ ok: true, data: rows });
  } catch (err) { handleError(res, err); }
};

exports.get = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM alerts WHERE id = $1", [req.params.id]);
    if (!rows.length) return res.status(404).json({ ok: false, message: "Não encontrado" });
    res.json({ ok: true, data: rows[0] });
  } catch (err) { handleError(res, err); }
};

exports.create = async (req, res) => {
  if (!validate(req, res)) return;
  try {
    const { title, description, severity, location, reporter } = req.body;
    const { rows } = await db.query(
      `INSERT INTO alerts (title, description, severity, location, reporter)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [title, description, severity, location, reporter || null]
    );
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) { handleError(res, err); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["ativo", "monitorando", "resolvido"];
    if (!valid.includes(status)) return res.status(400).json({ ok: false, message: "Status inválido" });

    const { rows } = await db.query(
      "UPDATE alerts SET status=$1 WHERE id=$2 RETURNING *",
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, message: "Não encontrado" });
    res.json({ ok: true, data: rows[0] });
  } catch (err) { handleError(res, err); }
};

exports.remove = async (req, res) => {
  try {
    const { rowCount } = await db.query("DELETE FROM alerts WHERE id=$1", [req.params.id]);
    if (!rowCount) return res.status(404).json({ ok: false, message: "Não encontrado" });
    res.json({ ok: true, message: "Removido com sucesso" });
  } catch (err) { handleError(res, err); }
};
