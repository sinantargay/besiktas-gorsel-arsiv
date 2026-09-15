CREATE TABLE `media_staff` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` TEXT NOT NULL,
  `duty` TEXT NOT NULL,
  `active` INTEGER NOT NULL DEFAULT 1,
  `created_by` INTEGER,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
);
CREATE INDEX `idx_media_staff_active_name` ON `media_staff` (`active`, `name`);
PRAGMA optimize;
