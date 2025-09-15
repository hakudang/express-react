// server.js
// Kết nối MySQL sử dụng mysql2/promise và tạo API Express cơ bản

const express = require('express');
const mysql = require('mysql2/promise');

// Tạo ứng dụng Express 
const app = express();
app.use(express.json());

// CORS middleware để cho phép truy cập từ frontend
const cors = require('cors');
app.use(cors());

// Thông tin kết nối MySQL (bạn cần chỉnh sửa cho phù hợp)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'admin@1111', // Thay bằng mật khẩu MySQL của bạn
  database: 'test_db', // Đảm bảo đã tạo database này
};



// API: Lấy danh sách user
app.get('/users', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM users');
    await connection.end();
    res.json(rows); // Trả về danh sách user
  } catch (err) {
    res.status(500).json({ error: err.message }); 
  }
});

// API: Thêm user mới
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
    await connection.end();
    res.json({ id: result.insertId, name, email }); // Trả về user vừa thêm
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// API: Sửa user
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
    await connection.end();
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ id, name, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Xóa user
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    await connection.end();
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
