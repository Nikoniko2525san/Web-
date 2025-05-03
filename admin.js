
const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  const user = req.session.user;
  if (!user || !user.is_admin) return res.status(403).send('Forbidden');

  try {
    const logs = await pool.query('SELECT * FROM logs ORDER BY timestamp DESC');
    const accessLogs = await pool.query('SELECT * FROM link_access_logs ORDER BY access_time DESC');
    res.json({ logs: logs.rows, accessLogs: accessLogs.rows });
  } catch (err) {
    res.status(500).send('Error fetching logs');
  }
});

module.exports = router;
