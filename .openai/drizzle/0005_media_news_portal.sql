ALTER TABLE `upload_sessions` ADD COLUMN `media_type` TEXT NOT NULL DEFAULT 'photo';
ALTER TABLE `upload_sessions` ADD COLUMN `subject_category` TEXT NOT NULL DEFAULT 'municipality';
ALTER TABLE `assets` ADD COLUMN `media_type` TEXT NOT NULL DEFAULT 'photo';
ALTER TABLE `assets` ADD COLUMN `subject_category` TEXT NOT NULL DEFAULT 'municipality';

CREATE TABLE `news_sources` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` TEXT NOT NULL,
  `url` TEXT NOT NULL,
  `source_type` TEXT NOT NULL DEFAULT 'rss',
  `subject_category` TEXT NOT NULL DEFAULT 'municipality',
  `active` INTEGER NOT NULL DEFAULT 1,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX `news_sources_url_unique` ON `news_sources` (`url`);

CREATE TABLE `news_items` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `source_name` TEXT NOT NULL,
  `title` TEXT NOT NULL,
  `url` TEXT NOT NULL,
  `summary` TEXT,
  `subject_category` TEXT NOT NULL DEFAULT 'municipality',
  `sentiment` TEXT NOT NULL DEFAULT 'neutral',
  `alarm_status` TEXT NOT NULL DEFAULT 'none',
  `published_at` TEXT,
  `created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX `news_items_url_unique` ON `news_items` (`url`);
CREATE INDEX `news_items_category_created` ON `news_items` (`subject_category`, `created_at`);
CREATE INDEX `news_items_alarm_created` ON `news_items` (`alarm_status`, `created_at`);

CREATE TABLE `notification_assignments` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `subject_category` TEXT NOT NULL UNIQUE,
  `user_id` INTEGER,
  `recipient_email` TEXT,
  `department` TEXT,
  `updated_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
PRAGMA optimize;
