const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/overview', async (req, res) => {
  try {
    // 1. Stats Cards
    const servedTodayRes = await pool.query(`
      SELECT count(*) as total_served 
      FROM tickets 
      WHERE status = 'completed' AND DATE(created_at) = CURRENT_DATE
    `);
    const totalServedToday = parseInt(servedTodayRes.rows[0].total_served, 10);

    const waitingRes = await pool.query(`
      SELECT count(*) as total_waiting 
      FROM tickets 
      WHERE status = 'waiting'
    `);
    const totalWaiting = parseInt(waitingRes.rows[0].total_waiting, 10);

    const activeCountersRes = await pool.query(`
      SELECT count(*) as active_counters 
      FROM counters 
      WHERE current_staff_id IS NOT NULL
    `);
    const activeCounters = parseInt(activeCountersRes.rows[0].active_counters, 10);

    const avgWaitRes = await pool.query(`
      SELECT COALESCE(EXTRACT(EPOCH FROM AVG(called_at - created_at))/60, 0) as avg_wait_minutes 
      FROM tickets 
      WHERE status IN ('serving', 'completed') AND DATE(created_at) = CURRENT_DATE
    `);
    const averageWaitTime = Math.round(parseFloat(avgWaitRes.rows[0].avg_wait_minutes));

    // 2. Active Counters Table
    const countersTableRes = await pool.query(`
      SELECT 
        c.id, c.name as counter_name, u.name as staff_name, q.name as service_name,
        (
          SELECT count(*) 
          FROM services s 
          WHERE s.counter_id = c.id AND s.status = 'completed' AND DATE(s.ended_at) = CURRENT_DATE
        ) as served_today
      FROM counters c
      JOIN users u ON c.current_staff_id = u.id
      JOIN queues q ON c.queue_id = q.id
      ORDER BY c.name
    `);
    const activeCountersList = countersTableRes.rows.map(row => ({
      ...row,
      served_today: parseInt(row.served_today, 10)
    }));

    // 3. Queue Distribution
    const queueDistRes = await pool.query(`
      SELECT 
        q.id, q.name, 
        COUNT(t.id) as waiting_count,
        (q.average_service_minutes * COUNT(t.id)) as est_wait_time
      FROM queues q
      LEFT JOIN tickets t ON t.queue_id = q.id AND t.status = 'waiting'
      GROUP BY q.id, q.name, q.average_service_minutes
      ORDER BY waiting_count DESC
    `);
    const queueDistribution = queueDistRes.rows.map(row => ({
      ...row,
      waiting_count: parseInt(row.waiting_count, 10),
      est_wait_time: parseInt(row.est_wait_time, 10)
    }));

    res.json({
      stats: {
        totalServedToday,
        totalWaiting,
        activeCounters,
        averageWaitTime
      },
      activeCountersList,
      queueDistribution
    });

  } catch (error) {
    console.error('Analytics Overview Error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

module.exports = router;
