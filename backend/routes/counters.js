const express = require("express");
const pool = require("../db");
const router = express.Router();
const validId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

router.post("/", async (req, res, next) => {
  const { queueId, name } = req.body;
  if (!validId(queueId) || !name?.trim()) return res.status(400).json({ message: "queueId and name are required" });
  try { const { rows } = await pool.query("INSERT INTO counters(queue_id,name) VALUES($1,$2) RETURNING *", [queueId,name.trim()]); res.status(201).json({ counter: rows[0] }); }
  catch (error) { if(error.code === "23503") return res.status(404).json({message:"Queue not found"}); next(error); }
});

router.post("/:counterId/call-next", async (req, res, next) => {
  if (!validId(req.params.counterId)) return res.status(400).json({message:"counterId must be a positive integer"});
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); const counter=await client.query("SELECT * FROM counters WHERE id=$1 FOR UPDATE",[req.params.counterId]);
    if(!counter.rows[0]) { await client.query("ROLLBACK"); return res.status(404).json({message:"Counter not found"}); }
    const active=await client.query("SELECT id FROM services WHERE counter_id=$1 AND status='in_progress'",[req.params.counterId]);
    if(active.rows[0]) { await client.query("ROLLBACK"); return res.status(409).json({message:"Current service must end first"}); }
    const ticket=await client.query("SELECT * FROM tickets WHERE queue_id=$1 AND status='waiting' ORDER BY token_number FOR UPDATE SKIP LOCKED LIMIT 1",[counter.rows[0].queue_id]);
    if(!ticket.rows[0]) { await client.query("ROLLBACK"); return res.status(404).json({message:"No waiting tokens"}); }
    await client.query("UPDATE tickets SET status='serving',called_at=NOW(),service_started_at=NOW() WHERE id=$1",[ticket.rows[0].id]);
    const service=await client.query("INSERT INTO services(ticket_id,counter_id) VALUES($1,$2) RETURNING *",[ticket.rows[0].id,req.params.counterId]); await client.query("COMMIT");
    res.json({ticket:{...ticket.rows[0],status:"serving"},service:service.rows[0]});
  } catch(error) { await client.query("ROLLBACK"); next(error); } finally {client.release();}
});
module.exports=router;
