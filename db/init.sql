CREATE DATABASE IF NOT EXISTS barberapp_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE barberapp_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'barbero', 'cliente') NOT NULL DEFAULT 'cliente',
  phone VARCHAR(30) NULL,
  email_verified TINYINT(1) NOT NULL DEFAULT 1,
  email_verification_token_hash VARCHAR(64) NULL,
  email_verification_expires_at DATETIME NULL,
  email_verified_at DATETIME NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email_verification_token_hash (email_verification_token_hash)
);

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  duration_minutes INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS barbers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  specialties VARCHAR(255) NULL,
  schedule_start TIME NOT NULL DEFAULT '09:00:00',
  schedule_end TIME NOT NULL DEFAULT '18:00:00',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_barbers_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  barber_id INT NOT NULL,
  service_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status ENUM('pendiente', 'confirmada', 'rechazada', 'cancelada') NOT NULL DEFAULT 'pendiente',
  payment DECIMAL(10, 2) NOT NULL DEFAULT 0,
  confirmation_token_hash VARCHAR(64) NULL,
  confirmation_expires_at DATETIME NULL,
  client_confirmed_at DATETIME NULL,
  client_cancelled_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_appointments_confirmation_token_hash (confirmation_token_hash),
  INDEX idx_appointments_schedule (barber_id, date, time),
  CONSTRAINT fk_appointments_client FOREIGN KEY (client_id) REFERENCES users(id),
  CONSTRAINT fk_appointments_barber FOREIGN KEY (barber_id) REFERENCES barbers(id),
  CONSTRAINT fk_appointments_service FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(80) NOT NULL,
  entity VARCHAR(80) NOT NULL,
  entity_id INT NULL,
  user_id INT NULL,
  details TEXT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (id, name, email, password, role, phone, email_verified, email_verified_at, active)
VALUES
  (1, 'Administrador', 'admin@barber.com', '$2b$10$zAuINn/G/XgPgY1cLvCX4O75JXaxMf8nk.KOxYwhL1apYl2qGtvia', 'admin', '4420000000', 1, NOW(), 1),
  (2, 'Carlos Barber', 'barbero@barber.com', '$2b$10$zAuINn/G/XgPgY1cLvCX4O75JXaxMf8nk.KOxYwhL1apYl2qGtvia', 'barbero', '4421111111', 1, NOW(), 1),
  (3, 'Cliente Demo', 'cliente@barber.com', '$2b$10$zAuINn/G/XgPgY1cLvCX4O75JXaxMf8nk.KOxYwhL1apYl2qGtvia', 'cliente', '4422222222', 1, NOW(), 1)
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO services (id, name, duration_minutes, price, active)
VALUES
  (1, 'Corte clasico', 45, 180.00, 1),
  (2, 'Corte y barba', 60, 260.00, 1),
  (3, 'Afeitado', 30, 120.00, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO barbers (id, user_id, specialties, schedule_start, schedule_end, active)
VALUES
  (1, 2, 'Corte clasico, barba y degradado', '09:00:00', '18:00:00', 1)
ON DUPLICATE KEY UPDATE specialties = VALUES(specialties);
