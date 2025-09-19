# Triển khai an toàn trên shared host (cPanel)
**Mục tiêu:** Server chỉ chạy **Node/Express** để phục vụ **static build** + API. Phần **build React** thực hiện **trên máy local**, tránh lỗi OOM/WebAssembly khi build trên host.

> Đích triển khai: `https://betterdigi.net/nodeapp` (BASE_PATH = `/nodeapp`).

---

## 0) Điều kiện tiên quyết
- **Server** (`server.js`)
  - Middleware theo **đúng thứ tự**:
    ```js
    const buildDir = path.join(__dirname, 'client', 'build');
    app.use(BASE_PATH, express.static(buildDir));  // 1) static
    app.use(BASE_PATH, router);                    // 2) API
    app.get(new RegExp(`^${BASE_PATH}(?!/api).*$`), (req, res) => { // 3) fallback
      res.sendFile(path.join(buildDir, 'index.html'));
    });
    ```
  - `BASE_PATH` phải là `/nodeapp` (khớp UI).
- **Client**
  - `client/package.json` có `"homepage": "/nodeapp"`.
  - Gọi API qua **relative path** (ví dụ gói lại ở `client/src/api.js`), **không** hard‑code `http://localhost:3001`.

---

## 1) Build UI **trên máy local**
```bash
cd client
npm ci || npm install

# (khuyến nghị) build nhẹ hơn
# macOS/Linux:
export GENERATE_SOURCEMAP=false
# Windows PowerShell:
$env:GENERATE_SOURCEMAP="false"

npm run build
```
Tạo file nén để upload:
- macOS/Linux:
  ```bash
  cd build && zip -r ../build.zip . && cd ..
  ```
- Windows PowerShell:
  ```powershell
  Compress-Archive -Path client\build\* -DestinationPath client\build.zip -Force
  ```

---

## 2) Upload **chỉ** thư mục build lên host
- cPanel → **File Manager** → vào thư mục dự án (ví dụ: `public_html/nodeapp/users-management/client/`).
- **Upload** `build.zip` → **Extract** (đè lên `client/build` nếu đã tồn tại).

> Không cần cài dependency phía client trên host.

---

## 3) Cấu hình Node.js App (server)
cPanel → **Setup Node.js App**:
- **Node.js**: 18.x  
- **Application root**: thư mục chứa `server.js` (ví dụ `public_html/nodeapp/users-management`)  
- **Application URL**: `/nodeapp`  
- **Startup file**: `server.js`  

**Environment variables** (Save/Update):
```
NODE_ENV=production
BASE_PATH=/nodeapp

DB_HOST=localhost
DB_PORT=3306
DB_USER=xtmdczqe_appadmin
DB_PASS=<mật_khẩu_db>
DB_NAME=xtmdczqe_demo03
DB_CONNECTION_LIMIT=5
```

---

## 4) Cài dependency **server** trên host
### Cách đơn giản (UI)
- Trong trang **Setup Node.js App** bấm **Run NPM Install**.

### Nếu UI không chạy được, dùng Terminal (nodevenv của app)
```bash
# Đứng tại thư mục app:
cd ~/public_html/nodeapp/users-management

# Xác định nodevenv (ví dụ 18)
NV="/home/xtmdczqe/nodevenv/home/xtmdczqe/public_html/nodeapp/users-management/18"
"$NV/bin/node" -v
"$NV/bin/npm" -v

# Cài deps server (LOCAL, không global)
"$NV/bin/npm" install --location=project
# hoặc:
# "$NV/bin/npm" ci --location=project
```

> **Không cần** cài deps cho `client` nữa vì build đã upload sẵn.

---

## 5) Restart & kiểm tra
- cPanel → **Setup Node.js App** → **Restart App**

Kiểm tra endpoint:
```bash
curl -s https://betterdigi.net/nodeapp/api/health   # -> {"ok":true}
curl -s https://betterdigi.net/nodeapp/users        # -> JSON (không phải HTML)
```
Mở UI: `https://betterdigi.net/nodeapp`

---

## 6) Lỗi hay gặp & cách xử
- **/users trả HTML**: Fallback SPA “nuốt API”. Sửa **thứ tự middleware** như mục 0.
- **404 asset sau build**: Thiếu `"homepage": "/nodeapp"` trong `client/package.json` → thêm, build lại **trên local**, re‑upload `client/build`.
- **DB connect fail**: Sai `DB_USER/DB_PASS/DB_NAME` (nhớ **tiền tố** cPanel), hoặc user chưa **Add to Database** (All Privileges).
- **npm ENOENT trỏ về `nodevenv/.../lib/package.json`**: npm đang ở **global mode**. Dùng npm trong **nodevenv của app** + thêm `--location=project`.
- **Build React bị OOM/WASM**: Không build trên host. Build local → upload `client/build`.
- **Gọi nhầm `/users`**: API mount dưới `/nodeapp/users` (không phải `/users`).

---

## 7) Quy trình cập nhật sau này
- **Chỉ đổi UI**: build local → upload đè `client/build` → **Restart App** (không cần `npm install`).
- **Đổi server**: pull/upload code → **Run NPM Install** (server) → **Restart App**.
- **Đổi DB**: import qua phpMyAdmin bằng `schema.sql` / `seed.sql`.

---

## 8) Phụ lục
**`client/package.json` (tối thiểu cần)**
```json
{
  "name": "client",
  "private": true,
  "version": "0.1.0",
  "homepage": "/nodeapp",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "proxy": "http://localhost:3001"
}
```

**`client/src/api.js` (gợi ý)**
```js
export const BASE_PATH = process.env.REACT_APP_BASE_PATH || '/nodeapp';
const withBase = (p = '') => `${BASE_PATH}${p}`;
export const API = {
  users: withBase('/users'),
  health: withBase('/api/health'),
};
export async function apiFetch(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res;
}
```

**`server.js` (đoạn quan trọng)**
```js
const buildDir = path.join(__dirname, 'client', 'build');
app.use(BASE_PATH, express.static(buildDir));  // static
app.use(BASE_PATH, router);                    // API
app.get(new RegExp(`^${BASE_PATH}(?!/api).*$`), (req, res) => {
  res.sendFile(path.join(buildDir, 'index.html')); // fallback
});
```
