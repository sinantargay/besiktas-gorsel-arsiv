ALTER TABLE `users` ADD COLUMN `department_scope` text;
ALTER TABLE `users` ADD COLUMN `permissions_json` text DEFAULT '[]' NOT NULL;
ALTER TABLE `users` ADD COLUMN `tc_identity_cipher` text;
ALTER TABLE `users` ADD COLUMN `tc_identity_iv` text;

CREATE TABLE `audit_logs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer,
  `action` text NOT NULL,
  `target_type` text,
  `target_id` text,
  `details_json` text DEFAULT '{}' NOT NULL,
  `ip_address` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
CREATE INDEX `idx_audit_logs_user_created` ON `audit_logs` (`user_id`, `created_at`);
CREATE INDEX `idx_audit_logs_action_created` ON `audit_logs` (`action`, `created_at`);

CREATE TABLE `disposal_requests` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `document_id` text NOT NULL,
  `reason` text NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL,
  `requested_by` integer NOT NULL,
  `archive_manager_approved_by` integer,
  `second_approved_by` integer,
  `cancelled_at` text,
  `cancel_reason` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`),
  FOREIGN KEY (`archive_manager_approved_by`) REFERENCES `users`(`id`),
  FOREIGN KEY (`second_approved_by`) REFERENCES `users`(`id`)
);
CREATE INDEX `idx_disposal_requests_status` ON `disposal_requests` (`status`);
