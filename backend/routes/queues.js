const express = require("express");
const pool = require("../db");
const router = express.Router();
const validId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT q.*, COUNT(t.id) FILTER (WHERE t.status = 'waiting')::int AS waiting_count FROM queues q LEFT JOIN tickets t ON t.queue_id=q.id GROUP BY q.id ORDER BY q.name`);
    res.json({ queues: rows });
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  const { name, code, averageServiceMinutes = 5 } = req.body;
  if (!name?.trim() || !code?.trim() || !validId(averageServiceMinutes)) return res.status(400).json({ message: "name, code, and a positive averageServiceMinutes are required" });
  try {
    const { rows } = await pool.query("INSERT INTO queues (name, code, average_service_minutes) VALUES ($1,$2,$3) RETURNING *", [name.trim(), code.trim().toUpperCase(), Number(averageServiceMinutes)]);
    res.status(201).json({ queue: rows[0] });
  } catch (error) { if (error.code === "23505") return res.status(409).json({ message: "Queue code already exists" }); next(error); }
});

router.get("/:queueId", async (req, res, next) => {
  if (!validId(req.params.queueId)) return res.status(400).json({ message: "queueId must be a positive integer" });
  try {
    const { rows } = await pool.query(`SELECT q.*, COUNT(t.id) FILTER (WHERE t.status='waiting')::int AS waiting_count, MAX(t.token_number) FILTER (WHERE t.status='serving')::int AS serving_token_number FROM queues q LEFT JOIN tickets t ON t.queue_id=q.id WHERE q.id=$1 GROUP BY q.id`, [req.params.queueId]);
    if (!rows[0]) return res.status(404).json({ message: "Queue not found" }); res.json({ queue: rows[0] });
  } catch (error) { next(error); }
});

router.post("/:queueId/tokens", async (req, res, next) => {
  if (!validId(req.params.queueId) || !req.body.customerName?.trim()) return res.status(400).json({ message: "A valid queueId and customerName are required" });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const queue = await client.query("SELECT * FROM queues WHERE id=$1 FOR UPDATE", [req.params.queueId]);
    if (!queue.rows[0]) { await client.query("ROLLBACK"); return res.status(404).json({ message: "Queue not found" }); }
    if (queue.rows[0].status !== "active") { await client.query("ROLLBACK"); return res.status(409).json({ message: "Queue is not accepting tokens" }); }
    const token = await client.query(`INSERT INTO tickets(queue_id,token_number,customer_name,customer_phone) VALUES($1,(SELECT COALESCE(MAX(token_number),0)+1 FROM tickets WHERE queue_id=$1),$2,$3) RETURNING *`, [req.params.queueId, req.body.customerName.trim(), req.body.customerPhone?.trim() || null]);
    const position = await client.query("SELECT COUNT(*)::int AS count FROM tickets WHERE queue_id=$1 AND status='waiting'", [req.params.queueId]);
    await client.query("COMMIT");
    res.status(201).json({ token: token.rows[0], position: position.rows[0].count, estimatedWaitMinutes: position.rows[0].count * queue.rows[0].average_service_minutes });
  } catch (error) { await client.query("ROLLBACK"); next(error); } finally { client.release(); }
});

router.get("/:queueId/tokens/:tokenNumber", async (req, res, next) => {
  if (!validId(req.params.queueId) || !validId(req.params.tokenNumber)) return res.status(400).json({ message: "IDs must be positive integers" });
  try {
    const { rows } = await pool.query(`SELECT t.*, CASE WHEN t.status='waiting' THEN (SELECT COUNT(*)::int FROM tickets a WHERE a.queue_id=t.queue_id AND a.status='waiting' AND a.token_number<=t.token_number) ELSE 0 END AS position, q.average_service_minutes FROM tickets t JOIN queues q ON q.id=t.queue_id WHERE t.queue_id=$1 AND t.token_number=$2`, [req.params.queueId, req.params.tokenNumber]);
    if (!rows[0]) return res.status(404).json({ message: "Token not found" }); const token=rows[0]; res.json({ token, estimatedWaitMinutes: token.position * token.average_service_minutes });
  } catch (error) { next(error); }
});
module.exports = router;
