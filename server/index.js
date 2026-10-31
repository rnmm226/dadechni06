const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'dadechni_secret_2026_tunisia';

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve the PWA frontend
app.use(express.static(path.join(__dirname, '..')));

// ─── Database setup ───────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'dadechni.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    email     TEXT    NOT NULL UNIQUE,
    password  TEXT    NOT NULL,
    created_at TEXT   NOT NULL DEFAULT (datetime('now'))
  );
`);

console.log('✅ SQLite database ready at server/dadechni.db');

// ─── Helper ───────────────────────────────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
  const result = stmt.run(name.trim(), email.toLowerCase(), hashed);

  const user = { id: result.lastInsertRowid, name: name.trim(), email: email.toLowerCase() };
  const token = signToken(user);

  console.log(`[REGISTER] New user: ${user.name} <${user.email}>`);
  return res.status(201).json({ message: 'Account created successfully!', name: user.name, email: user.email, token });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'No account found with this email.' });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Incorrect password. Please try again.' });
  }

  const token = signToken(user);
  console.log(`[LOGIN] User logged in: ${user.name} <${user.email}>`);
  return res.json({ message: 'Login successful!', name: user.name, email: user.email, token });
});

// GET /api/auth/me  (verify token)
app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }
  try {
    const payload = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(payload.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json(user);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

// GET /api/users  (admin — list users count)
app.get('/api/users/count', (req, res) => {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM users').get();
  res.json({ total: count });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🌍 Dadechni Backend running           ║
  ║   http://localhost:${PORT}                  ║
  ║   API: http://localhost:${PORT}/api/auth    ║
  ╚══════════════════════════════════════════╝
  `);
});
