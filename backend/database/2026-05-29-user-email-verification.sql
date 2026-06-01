ALTER TABLE users
  ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 1 AFTER phone,
  ADD COLUMN email_verification_token_hash VARCHAR(64) NULL AFTER email_verified,
  ADD COLUMN email_verification_expires_at DATETIME NULL AFTER email_verification_token_hash,
  ADD COLUMN email_verified_at DATETIME NULL AFTER email_verification_expires_at,
  ADD INDEX idx_users_email_verification_token_hash (email_verification_token_hash);

UPDATE users
SET email_verified = 1,
    email_verified_at = COALESCE(email_verified_at, created_at, NOW())
WHERE email_verified = 1;
