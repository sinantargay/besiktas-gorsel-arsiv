CREATE TABLE `upload_sessions` (
  `id` TEXT PRIMARY KEY NOT NULL,
  `r2_key` TEXT NOT NULL,
  `r2_upload_id` TEXT NOT NULL,
  `user_id` INTEGER NOT NULL,
  `file_name` TEXT NOT NULL,
  `content_type` TEXT NOT NULL,
  `file_size` INTEGER NOT NULL,
  `event_name` TEXT NOT NULL,
  `event_date` TEXT NOT NULL,
  `department` TEXT NOT NULL,
  `location` TEXT,
  `photographer` TEXT,
  `keywords` TEXT,
  `description` TEXT,
  `status` TEXT NOT NULL DEFAULT 'uploading',
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

CREATE TABLE `assets` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `r2_key` TEXT NOT NULL UNIQUE,
  `file_name` TEXT NOT NULL,
  `content_type` TEXT NOT NULL,
  `file_size` INTEGER NOT NULL,
  `event_name` TEXT NOT NULL,
  `event_date` TEXT NOT NULL,
  `department` TEXT NOT NULL,
  `location` TEXT,
  `photographer` TEXT,
  `keywords` TEXT,
  `description` TEXT,
  `uploaded_by` INTEGER NOT NULL,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`)
);

CREATE INDEX `assets_event_date_idx` ON `assets` (`event_date`);
CREATE INDEX `assets_department_idx` ON `assets` (`department`);
CREATE INDEX `upload_sessions_user_idx` ON `upload_sessions` (`user_id`, `status`);
