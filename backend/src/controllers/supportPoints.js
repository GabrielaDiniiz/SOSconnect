const { validationResult } = require("express-validator");
const db = require("../config/db");

const handleError = (res, err) => {
  console.error(err.message);
  res.status(500).json({ ok: false, message: "Erro interno do servidor" });
};

exports.list = async (req, res) => {
  try {
    const { type, status } = req.query;
    const conditions = [];
    const params = [];

    if (type) conditions.push(`type = $${params.push(type)}`);
    if (status) conditions.push(`status = $${params.push(status)}`);

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await db.query(`SELECT * FROM support_points ${where} ORDER BY name`, params);
    res.json({ ok: true, data: rows });
  } catch (err) { handleError(res, err); }
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ ok: false, errors: errors.array() });

  try {
    const { name, type, location, contact, capacity, resources } = req.body;
    const resList = Array.isArray(resources)
      ? resources
      : (resources || "").split(",").map((s) => s.trim()).filter(Boolean);

    const { rows } = await db.query(
      `INSERT INTO support_points (name, type, location, contact, capacity, resources)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, type, location, contact || null, capacity ? Number(capacity) : null, resList]
    );
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) { handleError(res, err); }
};

exports.update = async (req, res) => {
  try {
    const { occupancy, status } = req.body;
    const { rows } = await db.query(
      `UPDATE support_points SET
        occupancy = COALESCE($1, occupancy),
        status    = COALESCE($2, status)
       WHERE id = $3 RETURNING *`,
      [occupancy != null ? Number(occupancy) : null, status || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, message: "Não encontrado" });
    res.json({ ok: true, data: rows[0] });
  } catch (err) { handleError(res, err); }
};
