DELETE FROM social_responsibilities
WHERE id NOT IN (
  SELECT COALESCE(MAX(CASE WHEN account_category = 'both' THEN id END), MAX(id))
  FROM social_responsibilities
  GROUP BY user_id
);

DELETE FROM social_staff_responsibilities
WHERE id NOT IN (
  SELECT COALESCE(MAX(CASE WHEN account_category = 'both' THEN id END), MAX(id))
  FROM social_staff_responsibilities
  GROUP BY staff_name
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_social_responsibilities_one_per_user
  ON social_responsibilities(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_social_staff_responsibilities_one_per_staff
  ON social_staff_responsibilities(staff_name);
