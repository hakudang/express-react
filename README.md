# Express + React Users Management (Deploy betterdigi.net/nodeapp)

Full‑stack demo: **Express (Node.js) + MySQL** (API) + **React** (UI).  
Mục tiêu production: chạy tại **https://betterdigi.net/nodeapp**.

> Trạng thái của bạn: **ĐÃ import DB** lên host (database `xtmdczqe_demo03`). Bước tiếp theo: cấu hình ENV, build UI, start app trên cPanel.

---

## 0) Quick Start (DEV → PROD)

```bash
# 1) Cài deps
npm install
cd client && npm install && cd ..

# 2) DEV (chạy 1 lệnh cho cả server + client)
npm i -D cross-env nodemon concurrently
# package.json (root) -> thêm scripts:
#  "dev:server": "cross-env NODE_ENV=development BASE_PATH=/nodeapp PORT=3001 nodemon server.js",
#  "dev:client": "npm start --prefix client",
#  "dev": "concurrently \"npm:dev:server\" \"npm:dev:client\"",
#  "build": "npm --prefix client run build"
npm run dev

# 3) BUILD UI khi deploy
npm run build   # tương đương: (cd client && npm run build)

# 4) PROD local test
cross-env NODE_ENV=production BASE_PATH=/nodeapp PORT=3001 node server.js
# mở http://localhost:3001/nodeapp
```

---

## 1) Cấu trúc thư mục

```
users-management/
├─ server.js                 # Express app (mount dưới BASE_PATH)
├─ package.json
├─ .env.example              # mẫu biến môi trường
├─ .env.production           # MẪU prod (đã tạo cho bạn) - KHÔNG commit mật khẩu
├─ sql/
│  ├─ schema.sql             # tạo bảng users (utf8mb4)
│  └─ seed.sql               # dữ liệu mẫu
├─ client/                   # React app (CRA)
│  ├─ package.json
│  └─ src/
│     ├─ api.js              # BASE_PATH/endpoint tập trung (đã tạo)
│     ├─ App.js
│     ├─ AddUserForm.js
│     └─ UserList.js
└─ docs/
   └─ DEPLOY-cPanel.md       # hướng dẫn cPanel chi tiết
```

**Điểm mấu chốt**  
- **BASE_PATH** = `/nodeapp` (API + UI đều chạy dưới sub‑path này).  
- **React** gọi API theo **relative path** qua `client/src/api.js` → không hard‑code `http://localhost:3001`.  
- **Express** phục vụ build tĩnh + SPA fallback dưới `BASE_PATH` bằng regex (không nuốt `/api`).

---

## 2) Backend (Express + MySQL)

### 2.1) Gói cần
```bash
npm install express mysql2 cors dotenv
```

### 2.2) Nạp ENV trong `server.js`
> Ở đầu file:
```js
require('dotenv').config(); // hoặc: import 'dotenv/config'
```

### 2.3) Kết nối MySQL (fail‑fast nếu thiếu ENV)
```js
function must(name){
  const v = process.env[name];
  if(!v) throw new Error(`Missing env ${name}`);
  return v;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: must('DB_USER'),
  password: must('DB_PASS'),
  database: must('DB_NAME'),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
  ssl: process.env.DB_SSL ? { rejectUnauthorized: true } : undefined,
});
```

### 2.4) API endpoints
- `GET   /nodeapp/users`
- `POST  /nodeapp/users` `{ name, email }`
- `PUT   /nodeapp/users/:id`
- `DELETE /nodeapp/users/:id`
- `GET   /nodeapp/api/health`

---

## 3) Frontend (React)

- `client/src/api.js` đã gom **BASE_PATH** + endpoint:
```js
export const BASE_PATH = process.env.REACT_APP_BASE_PATH || '/nodeapp';
export const API = {
  users: `${BASE_PATH}/users`,
  health: `${BASE_PATH}/api/health`,
};
```
- Dev: trong `client/package.json` nên có
```json
{ "proxy": "http://localhost:3001" }
```
- Build:
```bash
npm run build  # tạo client/build/
```

---

## 4) Database

### 4.1) Local
Schema tham khảo (khớp file `sql/schema.sql`):
```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.2) Production (host)
Bạn đã import xong vào **`xtmdczqe_demo03`**. Nếu cần re‑import: dùng `sql/schema.sql` (utf8mb4_unicode_ci).  
**Note collation:** nếu dump từ MySQL 8 xuất hiện `utf8mb4_0900_ai_ci` → thay bằng `utf8mb4_unicode_ci` trước khi import.

---

## 5) Deploy lên cPanel (betterdigi.net/nodeapp)

### 5.1) Chuẩn bị
- **Node.js**: 18.x (Passenger ổn định)
- **Application root**: thư mục dự án (VD: `~/nodeapp/users-management`)
- **Application URL**: `/nodeapp`
- **Entry**: `server.js`
- **DB**: đã có `xtmdczqe_demo03` + user `xtmdczqe_appadmin`

### 5.2) Cài deps + build trên host
```bash
cd ~/nodeapp/users-management
npm install
cd client && npm install && npm run build && cd ..
```

### 5.3) Set ENV trong **Setup Node.js App**
```
NODE_ENV=production
BASE_PATH=/nodeapp
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_USER=xtmdczqe_appadmin
DB_PASS=<<mật_khẩu_user_này>>
DB_NAME=xtmdczqe_demo03
DB_CONNECTION_LIMIT=5
```
Nhấn **Save/Update** → **Start/Restart App**.

### 5.4) Verify
```bash
# Health
curl -s https://betterdigi.net/nodeapp/api/health

# Users
curl -s https://betterdigi.net/nodeapp/users
```
Mở trình duyệt: **https://betterdigi.net/nodeapp**.

---

## 6) Troubleshooting “gặp là xử”

- **Unknown collation `utf8mb4_0900_ai_ci`**: dump từ MySQL 8 → đổi sang `utf8mb4_unicode_ci` rồi import lại.
- **Unable to fork / Passenger error** (CloudLinux limits): đóng app khác, giảm tiến trình khi build, hoặc nhờ host tăng **PMEM/EP**.
- **404 khi refresh React**: đã cấu hình SPA fallback regex như README (không dùng `*` ở Express 5).
- **CORS ở dev**: dùng proxy CRA và gọi relative `/nodeapp/...`; production cùng domain/path thì không cần CORS.
- **Cannot GET /nodeapp**: chưa build UI (`client/build/`) hoặc `BASE_PATH` sai.
- **DB connect fail**: kiểm tra `DB_USER/DB_NAME` có **tiền tố** cPanel, quyền user đã **Add to Database**, và `DB_PASS` đúng.
- **Port bị chiếm** (dev): đổi `PORT` trong script, proxy theo.

---

## 7) Lệnh nhanh bạn dùng nhiều

```bash
# Restart app sau khi đổi ENV/Code (cPanel UI)
# → Setup Node.js App → Restart App

# Build lại UI sau khi sửa React
npm run build

# Import dữ liệu mẫu (phpMyAdmin)
# → Import sql/seed.sql
```

---

## 8) License
MIT (tuỳ chỉnh theo dự án của bạn).
