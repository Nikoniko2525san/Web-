
const express = require('express');
const pool = require('../db');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

router.post('/create', async (req, res) => {
  const { original_url } = req.body;
  const short_id = uuidv4().slice(0, 8);
  const user = req.session.user;
  const ip = req.ip;

  if (!user) return res.status(401).send('Unauthorized');

  try {
    await pool.query(
      'INSERT INTO links (short_id, original_url, created_by, creator_ip) VALUES ($1, $2, $3, $4)',
      [short_id, original_url, user.username, ip]
    );

    await pool.query(
      'INSERT INTO logs (username, password, ipv6, action) VALUES ($1, $2, $3, $4)',
      [user.username, '******', ip, `Created short link: ${short_id}`]
    );

    res.json({ short_url: `/s/${short_id}` });
  } catch (err) {
    res.status(500).send('Error creating link');
  }
});

router.get('/s/:id', async (req, res) => {
  const short_id = req.params.id;
  const ip = req.ip;

  try {
    const result = await pool.query('SELECT * FROM links WHERE short_id = $1', [short_id]);
    if (result.rows.length === 0) return res.status(404).send('Link not found');

    await pool.query(
      'INSERT INTO link_access_logs (short_id, access_ip) VALUES ($1, $2)',
      [short_id, ip]
    );

    await pool.query(
      'INSERT INTO logs (username, password, ipv6, action) VALUES ($1, $2, $3, $4)',
      ['guest', '******', ip, `Accessed short link: ${short_id}`]
    );

    res.redirect(result.rows[0].original_url);
  } catch (err) {
    res.status(500).send('Error redirecting');
  }
});

module.exports = router;
