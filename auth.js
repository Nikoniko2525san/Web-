
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const ipv6 = req.ip;

  try {
    const ipCheck = await pool.query('SELECT * FROM users WHERE ipv6 = $1', [ipv6]);
    if (ipCheck.rows.length > 0) {
      return res.status(400).send('This IP has already registered an account.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password, ipv6) VALUES ($1, $2, $3)',
      [username, hashedPassword, ipv6]
    );

    await pool.query('INSERT INTO logs (username, password, ipv6, action) VALUES ($1, $2, $3, $4)',
      [username, password, ipv6, 'User registered']);

    res.redirect('/login.html');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const ipv6 = req.ip;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) return res.status(400).send('User not found');

    const user = userResult.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).send('Invalid credentials');

    req.session.user = { username: user.username, is_admin: user.is_admin };
    await pool.query('INSERT INTO logs (username, password, ipv6, action) VALUES ($1, $2, $3, $4)',
      [username, password, ipv6, 'User logged in']);

    res.redirect('/dashboard.html');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
