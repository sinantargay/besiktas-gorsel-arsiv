CREATE TABLE social_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_category TEXT NOT NULL CHECK(account_category IN ('president','municipality')),
  platform TEXT NOT NULL,
  account_name TEXT NOT NULL,
  connection_status TEXT NOT NULL DEFAULT 'pending' CHECK(connection_status IN ('pending','connected','inactive')),
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE social_responsibilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  account_category TEXT NOT NULL CHECK(account_category IN ('president','municipality','both')),
  active INTEGER NOT NULL DEFAULT 1,
  assigned_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id)
);

CREATE UNIQUE INDEX idx_social_responsibilities_user_category
ON social_responsibilities(user_id, account_category);

CREATE TABLE social_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_category TEXT NOT NULL CHECK(account_category IN ('president','municipality')),
  caption TEXT NOT NULL,
  asset_ids_json TEXT NOT NULL,
  account_ids_json TEXT NOT NULL DEFAULT '[]',
  scheduled_at TEXT,
  status TEXT NOT NULL DEFAULT 'awaiting_connection' CHECK(status IN ('draft','awaiting_connection','ready','published','failed')),
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_social_posts_status_created_at
ON social_posts(status, created_at DESC);

PRAGMA optimize;
