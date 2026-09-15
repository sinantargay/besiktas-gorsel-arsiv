CREATE TABLE `facility_records` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `category` TEXT NOT NULL,
  `name` TEXT NOT NULL,
  `address` TEXT,
  `description` TEXT,
  `year` INTEGER,
  `image_r2_key` TEXT,
  `image_content_type` TEXT,
  `created_by` INTEGER NOT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
);
CREATE INDEX `idx_facility_records_category_name` ON `facility_records` (`category`, `name`);
CREATE INDEX `idx_facility_records_created_at` ON `facility_records` (`created_at`);
PRAGMA optimize;
