const db = require("../config/db");

exports.get = async (req, res) => {
  try {
    const [alerts, requests, points, offers] = await Promise.all([
      db.query(`SELECT COUNT(*) total, COUNT(*) FILTER (WHERE status='ativo') ativos,
                COUNT(*) FILTER (WHERE severity='critico') criticos FROM alerts`),
      db.query(`SELECT COUNT(*) total, COUNT(*) FILTER (WHERE status='pendente') pendentes,
                COUNT(*) FILTER (WHERE urgency='critica') criticos,
                COALESCE(SUM(people),0) pessoas FROM help_requests`),
      db.query(`SELECT COUNT(*) total, COUNT(*) FILTER (WHERE status='ativo') ativos,
                COALESCE(SUM(capacity),0) capacidade, COALESCE(SUM(occupancy),0) ocupacao FROM support_points`),
      db.query(`SELECT COUNT(*) total, COUNT(*) FILTER (WHERE status='disponivel') disponiveis FROM help_offers`),
    ]);

    res.json({
      ok: true,
      data: {
        alerts: alerts.rows[0],
        requests: requests.rows[0],
        points: points.rows[0],
        offers: offers.rows[0],
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ ok: false, message: "Erro interno" });
  }
};
