ALTER TABLE `assets` ADD COLUMN `analysis_status` TEXT NOT NULL DEFAULT 'waiting_provider';
ALTER TABLE `assets` ADD COLUMN `suggested_keywords` TEXT;
ALTER TABLE `assets` ADD COLUMN `suggested_description` TEXT;
ALTER TABLE `assets` ADD COLUMN `detected_people` TEXT;
ALTER TABLE `assets` ADD COLUMN `analysis_review_status` TEXT NOT NULL DEFAULT 'pending';

CREATE INDEX `assets_analysis_status_idx` ON `assets` (`analysis_status`, `created_at`);
PRAGMA optimize;
