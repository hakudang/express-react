// server.js
// Kết nối MySQL sử dụng mysql2/promise và tạo API Express cơ bản

const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

// Thông tin kết nối MySQL (bạn cần chỉnh sửa cho phù hợp)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'admin@1111', // Thay bằng mật khẩu MySQL của bạn
  database: 'test_db', // Đảm bảo đã tạo database này
};

// CORS middleware để cho phép truy cập từ frontend
const cors = require('cors');
app.use(cors());

// API: Lấy danh sách user
app.get('/users', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM users');
    await connection.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Thêm user mới
app.post('/users', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute('INSERT INTO users (name) VALUES (?)', [name]);
    await connection.end();
    res.json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
