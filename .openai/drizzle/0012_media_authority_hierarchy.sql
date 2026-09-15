UPDATE users SET role = 'bio_media_staff' WHERE role = 'data_entry';
UPDATE users SET role = 'bio_social_media' WHERE role = 'social_media_manager';
UPDATE users SET role = 'standard_user' WHERE role = 'auditor';
