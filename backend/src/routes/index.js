const router = require("express").Router();
const { body } = require("express-validator");
const alerts = require("../controllers/alerts");
const requests = require("../controllers/helpRequests");
const points = require("../controllers/supportPoints");
const offers = require("../controllers/helpOffers");
const stats = require("../controllers/stats");

// ── Stats ──────────────────────────────────────────────────────
router.get("/stats", stats.get);

// ── Alerts ─────────────────────────────────────────────────────
const alertRules = [
  body("title").notEmpty().isLength({ max: 200 }),
  body("description").notEmpty(),
  body("severity").isIn(["baixo", "medio", "alto", "critico"]),
  body("location").notEmpty(),
];
router.get("/alerts", alerts.list);
router.get("/alerts/:id", alerts.get);
router.post("/alerts", alertRules, alerts.create);
router.patch("/alerts/:id/status", alerts.updateStatus);
router.delete("/alerts/:id", alerts.remove);

// ── Help Requests ──────────────────────────────────────────────
const requestRules = [
  body("name").notEmpty(),
  body("contact").notEmpty(),
  body("location").notEmpty(),
  body("need_type").isIn(["resgate", "abrigo", "alimento", "medicamento", "agua", "outro"]),
  body("description").notEmpty(),
];
router.get("/requests", requests.list);
router.post("/requests", requestRules, requests.create);
router.patch("/requests/:id/status", requests.updateStatus);

// ── Support Points ─────────────────────────────────────────────
const pointRules = [
  body("name").notEmpty(),
  body("type").isIn(["abrigo", "distribuicao", "saude", "resgate", "outro"]),
  body("location").notEmpty(),
];
router.get("/points", points.list);
router.post("/points", pointRules, points.create);
router.patch("/points/:id", points.update);

// ── Help Offers ────────────────────────────────────────────────
const offerRules = [
  body("name").notEmpty(),
  body("contact").notEmpty(),
  body("location").notEmpty(),
  body("offer_type").isIn(["transporte", "abrigo", "alimento", "medicamento", "voluntariado", "doacao", "outro"]),
  body("description").notEmpty(),
];
router.get("/offers", offers.list);
router.post("/offers", offerRules, offers.create);
router.patch("/offers/:id/status", offers.updateStatus);

module.exports = router;
