const { validationResult } = require("express-validator");
const db = require("../config/db");

const handleError = (res, err) => {
  console.error(err.message);
  res.status(500).json({ ok: false, message: "Erro interno do servidor" });
};

exports.list = async (req, res) => {
  try {
    const { status, offer_type } = req.query;
    const conditions = [];
    const params = [];

    if (status) conditions.push(`status = $${params.push(status)}`);
    if (offer_type) conditions.push(`offer_type = $${params.push(offer_type)}`);

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await db.query(`SELECT * FROM help_offers ${where} ORDER BY created_at DESC`, params);
    res.json({ ok: true, data: rows });
  } catch (err) { handleError(res, err); }
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ ok: false, errors: errors.array() });

  try {
    const { name, contact, location, offer_type, description, availability } = req.body;
    const { rows } = await db.query(
      `INSERT INTO help_offers (name, contact, location, offer_type, description, availability)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, contact, location, offer_type, description, availability || null]
    );
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) { handleError(res, err); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["disponivel", "em_uso", "indisponivel"];
    if (!valid.includes(status)) return res.status(400).json({ ok: false, message: "Status inválido" });

    const { rows } = await db.query(
      "UPDATE help_offers SET status=$1 WHERE id=$2 RETURNING *",
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, message: "Não encontrado" });
    res.json({ ok: true, data: rows[0] });
  } catch (err) { handleError(res, err); }
};
