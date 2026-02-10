const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE users (id INT, name TEXT, password TEXT)");
  db.run("INSERT INTO users VALUES (1, 'admin', 'password123')");
});

// Vulnerability: SQL Injection
function getUser(id, callback) {
  const query = "SELECT * FROM users WHERE id = " + id;
  db.get(query, (err, row) => {
    callback(err, row);
  });
}

// Vulnerability: Another SQL Injection
function findUserByName(name, callback) {
  const query = `SELECT * FROM users WHERE name = '${name}'`;
  db.all(query, (err, rows) => {
    callback(err, rows);
  });
}

module.exports = { getUser, findUserByName };
