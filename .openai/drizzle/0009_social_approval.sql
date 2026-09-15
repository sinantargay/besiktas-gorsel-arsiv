ALTER TABLE social_posts ADD COLUMN review_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE social_posts ADD COLUMN reviewer_note TEXT;
ALTER TABLE social_posts ADD COLUMN reviewed_by INTEGER REFERENCES users(id);
ALTER TABLE social_posts ADD COLUMN reviewed_at TEXT;

CREATE INDEX idx_social_posts_review_status_created_at
ON social_posts(review_status, created_at DESC);

PRAGMA optimize;
