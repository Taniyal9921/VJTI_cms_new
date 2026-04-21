-- Run once if your `users` table was created before student_reg_no / year_of_study existed.
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_reg_no VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS year_of_study VARCHAR(32);
