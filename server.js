// @file: server.js
// Runtime: Node 18.x (cPanel Passenger OK)
// CommonJS

'use strict';

require('dotenv').config();            // nạp .env nếu có

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');

const app = express();
app.disable('x-powered-by');

const BASE_PATH = process.env.BASE_PATH || '/nodeapp';
const PORT = Number(process.env.PORT || 3001);
const IS_DEV = process.env.NODE_ENV !== 'production';

// ───────────────────────────────────────────────────────────────────────────────
// Middlewares
// ───────────────────────────────────────────────────────────────────────────────
const allowOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors(allowOrigin === '*' ? {} : { origin: allowOrigin, credentials: true }));
app.use(express.json());

// ───────────────────────────────────────────────────────────────────────────────
// MySQL Pool (fail-fast nếu thiếu ENV khi prod)
// ───────────────────────────────────────────────────────────────────────────────
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || (IS_DEV ? 'root' : '');
const DB_PASS = process.env.DB_PASS || (IS_DEV ? 'admin@1111' : '');
const DB_NAME = process.env.DB_NAME || (IS_DEV ? 'test_db' : '');
const DB_CONN_LIMIT = Number(process.env.DB_CONNECTION_LIMIT || 5);

// Fail-fast ở production nếu thiếu cấu hình
if (!IS_DEV && (!DB_USER || !DB_PASS || !DB_NAME)) {
  console.error('[FATAL] Missing DB env. Required: DB_USER, DB_PASS, DB_NAME');
  process.exit(1);
}

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: DB_CONN_LIMIT,
  // đặt DB_SSL=true nếu kết nối managed DB yêu cầu TLS
  ssl: process.env.DB_SSL ? { rejectUnauthorized: true } : undefined,
});

// Ping DB khi khởi động (báo lỗi sớm nếu cấu hình sai)
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log(`[DB] Connected to '${DB_NAME}' on ${DB_HOST}`);
  } catch (err) {
    console.error('[DB] Connection error:', err.message);
    process.exit(1);
  }
})();

// ───────────────────────────────────────────────────────────────────────────────
// Routes (mount dưới BASE_PATH)
// ───────────────────────────────────────────────────────────────────────────────
const router = express.Router();

// Healthcheck
router.get('/api/health', (req, res) => res.json({ ok: true }));

// Users CRUD
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email FROM users ORDER BY id DESC'
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'DB error' });
  }
});

router.post('/users', async (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
  try {
    const [r] = await pool.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
    res.json({ id: r.insertId, name, email });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'DB error' });
  }
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
  try {
    const [r] = await pool.query('UPDATE users SET name=?, email=? WHERE id=?', [name, email, id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ id: Number(id), name, email });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'DB error' });
  }
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [r] = await pool.query('DELETE FROM users WHERE id=?', [id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'DB error' });
  }
});

// ───────────────────────────────────────────────────────────────────────────────
// Static + SPA fallback (Express 5: tránh '*' nuốt /api)
// ───────────────────────────────────────────────────────────────────────────────
const buildDir = path.join(__dirname, 'client', 'build');
app.use(BASE_PATH, express.static(buildDir));

// API routes  ✅ đặt TRƯỚC fallback
app.use(BASE_PATH, router);

// SPA fallback (chỉ khi KHÔNG trùng /api)  
app.get(new RegExp(`^${BASE_PATH}(?!/api).*$`), (req, res) => {
  res.sendFile(path.join(buildDir, 'index.html'));
});

// ───────────────────────────────────────────────────────────────────────────────
// Start
// ───────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () =>
  console.log(`Server running on :${PORT}  base=${BASE_PATH}  env=${process.env.NODE_ENV || 'development'}`)
);

// An toàn hơn khi có lỗi ngoài try/catch
process.on('unhandledRejection', (r) => console.error('[unhandledRejection]', r));
process.on('uncaughtException', (e) => {
  console.error('[uncaughtException]', e);
  if (!IS_DEV) process.exit(1);
});
