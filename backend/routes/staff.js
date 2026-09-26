const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get physical counters for a department
router.get('/counters/:queueId', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, u.name as staff_name 
      FROM counters c
      LEFT JOIN users u ON c.current_staff_id = u.id
      WHERE c.queue_id = $1
      ORDER BY c.name
    `, [req.params.queueId]);
    res.json({ counters: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Occupy a counter
router.post('/counters/:counterId/occupy', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID required' });

  try {
    const { rows } = await pool.query(`
      UPDATE counters 
      SET current_staff_id = $1 
      WHERE id = $2 AND current_staff_id IS NULL
      RETURNING *
    `, [userId, req.params.counterId]);

    if (rows.length === 0) {
      return res.status(409).json({ message: 'Counter is already occupied or does not exist' });
    }
    res.json({ counter: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Release a counter
router.post('/counters/:counterId/release', async (req, res) => {
  try {
    await pool.query('UPDATE counters SET current_staff_id = NULL WHERE id = $1', [req.params.counterId]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming tickets for the queue
router.get('/queue/:queueId', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM tickets 
      WHERE queue_id = $1 AND status = 'waiting' 
      ORDER BY token_number ASC
    `, [req.params.queueId]);
    res.json({ tickets: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active ticket for the counter
router.get('/active-ticket/:counterId', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT t.*, q.name as queue_name, q.average_service_minutes
      FROM tickets t
      JOIN services s ON t.id = s.ticket_id
      JOIN queues q ON t.queue_id = q.id
      WHERE s.counter_id = $1 AND s.status = 'in_progress'
    `, [req.params.counterId]);
    res.json({ ticket: rows[0] || null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Call the next ticket
router.post('/call-next', async (req, res) => {
  const { queueId, counterId } = req.body;
  if (!queueId || !counterId) return res.status(400).json({ message: 'Missing parameters' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if counter already has an active ticket
    const activeCheck = await client.query(`
      SELECT id FROM services WHERE counter_id = $1 AND status = 'in_progress'
    `, [counterId]);
    
    if (activeCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Counter is already serving a ticket. Complete it first.' });
    }

    // Get the next waiting ticket
    const ticketRes = await client.query(`
      SELECT * FROM tickets
      WHERE queue_id = $1 AND status = 'waiting'
      ORDER BY token_number ASC LIMIT 1 FOR UPDATE SKIP LOCKED
    `, [queueId]);

    if (ticketRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'No tickets waiting' });
    }
    
    const ticket = ticketRes.rows[0];

    // Update ticket status
    await client.query(`UPDATE tickets SET status = 'serving', called_at = NOW() WHERE id = $1`, [ticket.id]);

    // Create service record
    await client.query(`
      INSERT INTO services (ticket_id, counter_id, status, started_at)
      VALUES ($1, $2, 'in_progress', NOW())
    `, [ticket.id, counterId]);

    await client.query('COMMIT');
    res.json({ ticket });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Complete or Skip a ticket
router.post('/complete', async (req, res) => {
  const { ticketId, counterId, status = 'completed' } = req.body; // status can be 'completed' or 'no_show'
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`UPDATE tickets SET status = $1, service_ended_at = NOW() WHERE id = $2`, [status, ticketId]);
    
    const serviceStatus = status === 'completed' ? 'completed' : 'cancelled';
    await client.query(`UPDATE services SET status = $1, ended_at = NOW() WHERE ticket_id = $2 AND counter_id = $3`, [serviceStatus, ticketId, counterId]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
