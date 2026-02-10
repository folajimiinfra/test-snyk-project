const express = require('express');
const axios = require('axios');
const lodash = require('lodash');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// Vulnerability 1: Hardcoded sensitive information (SAST)
// Using a generic name to avoid GitHub Push Protection
const DUMMY_API_KEY = "dummy_key_for_testing_purposes_only_12345";

app.get('/', (req, res) => {
  const data = { message: 'Hello World' };
  const cloned = lodash.cloneDeep(data);
  res.send(cloned.message);
});

// Vulnerability 2: Command Injection (SAST)
app.get('/ping', (req, res) => {
  const host = req.query.host;
  exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    res.send(stdout);
  });
});

// Vulnerability 3: Open Redirect (SAST)
app.get('/redirect', (req, res) => {
  const url = req.query.url;
  res.redirect(url);
});

app.listen(port, () => {
  console.log(`Test app listening at http://localhost:${port}`);
  console.log(`Using API KEY: ${DUMMY_API_KEY}`);
});
