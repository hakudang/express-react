-- sql/seed.sql
-- Mục đích: THÊM DỮ LIỆU MẪU để test nhanh UI/API.
-- Chạy sau khi đã có bảng `users` (do schema.sql tạo).
-- ⚠️ Không xóa dữ liệu cũ. Nếu muốn xóa trước khi seed, bỏ comment dòng TRUNCATE:
-- TRUNCATE TABLE `users`;

INSERT INTO `users` (`name`, `email`) VALUES
('Dang', 'dang@example.com'),
('Test User', 'test@example.com');
