CREATE TABLE `users` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `password_hash` text NOT NULL,
  `password_salt` text NOT NULL,
  `password_iterations` integer NOT NULL,
  `name` text NOT NULL,
  `surname` text NOT NULL,
  `phone` text NOT NULL,
  `extension` text,
  `department` text NOT NULL,
  `job_title` text NOT NULL,
  `job_description` text NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL,
  `role` text DEFAULT 'viewer' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `approved_at` text,
  `approved_by` integer,
  FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`)
);
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
CREATE INDEX `idx_users_status` ON `users` (`status`);
CREATE TABLE `sessions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `token_hash` text NOT NULL,
  `user_id` integer NOT NULL,
  `expires_at` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
CREATE UNIQUE INDEX `sessions_token_hash_unique` ON `sessions` (`token_hash`);
CREATE INDEX `idx_sessions_user_id` ON `sessions` (`user_id`);
CREATE INDEX `idx_sessions_expires_at` ON `sessions` (`expires_at`);
