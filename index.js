const express = require('express');
const axios = require('axios');
const lodash = require('lodash');
const { exec } = require('child_process');
const crypto = require('crypto');

const app = express();
const port = 3000;

// Vulnerability 1: Hardcoded sensitive information (SAST)
const DUMMY_API_KEY = "dummy_key_for_testing_purposes_only_12345";
const PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA75zq...\n-----END RSA PRIVATE KEY-----";

app.get('/', (req, res) => {
  const data = { message: 'Hello World' };
  const cloned = lodash.cloneDeep(data);
  res.send(cloned.message);
});

// Vulnerability 2: Command Injection (SAST)
app.get('/ping', (req, res) => {
  const host = req.query.host;
  // This is a classic command injection vulnerability
  exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    res.send(stdout);
  });
});

// Vulnerability 3: Open Redirect (SAST)
app.get('/redirect', (req, res) => {
  const url = req.query.url;
  // Insecure redirect
  res.redirect(url);
});

// Vulnerability 4: Insecure Randomness (SAST)
app.get('/token', (req, res) => {
  // Math.random() is not cryptographically secure
  const token = Math.random().toString(36).substring(7);
  res.send({ token });
});

// Vulnerability 5: Improper validation of integrity (SAST)
app.get('/data', (req, res) => {
    const hash = crypto.createHash('md5').update(req.query.data).digest('hex');
    res.send({ hash });
});

app.listen(port, () => {
  console.log(`Test app listening at http://localhost:${port}`);
  console.log(`Using API KEY: ${DUMMY_API_KEY}`);
  console.log(`Key available: ${PRIVATE_KEY.substring(0, 20)}...`);
});
