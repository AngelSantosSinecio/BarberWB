ALTER TABLE appointments
  ADD COLUMN confirmation_token_hash VARCHAR(64) NULL AFTER payment,
  ADD COLUMN confirmation_expires_at DATETIME NULL AFTER confirmation_token_hash,
  ADD COLUMN client_confirmed_at DATETIME NULL AFTER confirmation_expires_at,
  ADD COLUMN client_cancelled_at DATETIME NULL AFTER client_confirmed_at,
  ADD INDEX idx_appointments_confirmation_token_hash (confirmation_token_hash);
