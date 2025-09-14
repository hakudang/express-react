# Express + React User Management Demo

## Mô tả
Ứng dụng mô phỏng backend Express (Node.js) kết nối MySQL và frontend React để hiển thị, thêm user.

## 1. Backend: Express + MySQL

- **Cài đặt:**
  ```bash
  npm install express mysql2 cors
  ```
- **Cấu hình:**
  - Sử dụng `express.json()` để nhận JSON.
  - Sử dụng `cors()` để cho phép frontend truy cập API.
  - Kết nối MySQL bằng `mysql2/promise`.
- **API:**
  - `GET /users`: Lấy danh sách user từ database.
  - `POST /users`: Nhận name, email từ client, thêm user vào database, trả về thông tin user vừa thêm (có id).

## 2. Frontend: React

- **Khởi tạo:**
  ```bash
  npx create-react-app client
  ```
- **Component chính:**
  - `UserList.js`: Gọi API GET `/users` để hiển thị danh sách user dạng bảng. Hỗ trợ reloadUsers qua ref.
  - `AddUserForm.js`: Form nhập name, email. Gửi POST request tới `/users`. Khi thêm thành công, gọi hàm reloadUsers để cập nhật danh sách.
- **Tích hợp trong `App.js`:**
  - Tạo ref `userListRef` để truy cập hàm reloadUsers trong `UserList`.
  - Khi thêm user thành công, gọi `userListRef.current.reloadUsers()` để cập nhật danh sách.

## 3. Quy trình hoạt động

1. **Hiển thị danh sách user:**
   - Khi mở trang, `UserList` gọi API `/users` và hiển thị dữ liệu từ backend.
2. **Thêm user mới:**
   - Người dùng nhập name, email vào form và nhấn Thêm.
   - `AddUserForm` gửi POST request tới backend.
   - Backend thêm user vào database, trả về thông tin user vừa thêm.
   - `AddUserForm` gọi hàm reloadUsers trong `UserList` để cập nhật lại danh sách user trên giao diện.

## 4. Kết quả
- Giao diện React luôn hiển thị danh sách user mới nhất.
- Thêm user mới không cần reload trang.
- Backend và frontend giao tiếp qua API rõ ràng, dễ mở rộng.

---

> Nếu cần code mẫu từng file hoặc mở rộng thêm chức năng, hãy xem các file trong project hoặc liên hệ để được hỗ trợ thêm!
