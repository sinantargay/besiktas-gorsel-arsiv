DELETE FROM social_accounts
WHERE lower(account_name) LIKE '%snnelftrgy%';

UPDATE social_accounts
SET account_name='@gaziaktuel'
WHERE lower(platform)='instagram'
  AND lower(account_name) LIKE '%gaziaktuel%';

DELETE FROM social_accounts
WHERE id NOT IN (
  SELECT MIN(id)
  FROM social_accounts
  GROUP BY account_category, lower(platform), lower(account_name)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_social_accounts_unique_target
ON social_accounts(account_category, platform, account_name);

CREATE TABLE IF NOT EXISTS social_staff_responsibilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_name TEXT NOT NULL,
  account_category TEXT NOT NULL CHECK(account_category IN ('president','municipality','both')),
  active INTEGER NOT NULL DEFAULT 1,
  assigned_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  UNIQUE(staff_name, account_category)
);

PRAGMA optimize;
