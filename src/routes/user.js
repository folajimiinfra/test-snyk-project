const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Vulnerability: Cross-Site Scripting (XSS)
router.get('/profile', (req, res) => {
  const name = req.query.name || 'Guest';
  res.send(`<h1>Welcome, ${name}</h1>`);
});

router.get('/:id', (req, res) => {
  db.getUser(req.params.id, (err, user) => {
    if (err) return res.status(500).send(err);
    res.json(user);
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Vulnerability: Plaintext storage / comparison
  db.findUserByName(username, (err, users) => {
    if (users && users.length > 0 && users[0].password === password) {
      res.send('Login successful');
    } else {
      res.status(401).send('Login failed');
    }
  });
});

module.exports = router;
