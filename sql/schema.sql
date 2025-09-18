-- sql/schema.sql
-- Mục đích: TẠO CẤU TRÚC BẢNG cho app Users Management.
-- Dùng được trên shared host (MySQL 5.x/MariaDB) vì KHÔNG chứa 'CREATE DATABASE'.
-- Collation dùng utf8mb4_unicode_ci để tương thích rộng, hiển thị tiếng Việt chuẩn.

-- ⚠️ Nếu muốn import an toàn (không ghi đè), giữ nguyên như dưới.
-- ⚠️ Nếu muốn 'ghi đè' bảng hiện có, bỏ comment dòng DROP TABLE:
-- DROP TABLE IF EXISTS `users`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  -- , UNIQUE KEY `uq_users_email` (`email`)  -- bật nếu muốn cấm trùng email
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
