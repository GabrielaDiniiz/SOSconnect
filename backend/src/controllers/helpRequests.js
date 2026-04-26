const { validationResult } = require("express-validator");
const db = require("../config/db");

const handleError = (res, err) => {
  console.error(err.message);
  res.status(500).json({ ok: false, message: "Erro interno do servidor" });
};

exports.list = async (req, res) => {
  try {
    const { status, urgency } = req.query;
    const conditions = [];
    const params = [];

    if (status) conditions.push(`status = $${params.push(status)}`);
    if (urgency) conditions.push(`urgency = $${params.push(urgency)}`);

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await db.query(
      `SELECT * FROM help_requests ${where}
       ORDER BY CASE urgency WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 ELSE 4 END, created_at DESC`,
      params
    );
    res.json({ ok: true, data: rows });
  } catch (err) { handleError(res, err); }
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ ok: false, errors: errors.array() });

  try {
    const { name, contact, location, need_type, urgency, people, description } = req.body;
    const { rows } = await db.query(
      `INSERT INTO help_requests (name, contact, location, need_type, urgency, people, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, contact, location, need_type, urgency || "media", Number(people) || 1, description]
    );
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) { handleError(res, err); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["pendente", "em_atendimento", "atendido", "cancelado"];
    if (!valid.includes(status)) return res.status(400).json({ ok: false, message: "Status inválido" });

    const { rows } = await db.query(
      "UPDATE help_requests SET status=$1 WHERE id=$2 RETURNING *",
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, message: "Não encontrado" });
    res.json({ ok: true, data: rows[0] });
  } catch (err) { handleError(res, err); }
};
