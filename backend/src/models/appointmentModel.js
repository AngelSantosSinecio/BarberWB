const pool = require('../config/database');

const baseSelect = `
  SELECT
    a.id,
    a.client_id,
    client.name AS client_name,
    client.email AS client_email,
    a.barber_id,
    barber_user.name AS barber_name,
    a.service_id,
    s.name AS service_name,
    s.duration_minutes,
    s.price AS service_price,
    DATE_FORMAT(a.date, '%Y-%m-%d') AS date,
    a.time,
    a.status,
    a.payment,
    a.confirmation_expires_at,
    a.created_at
  FROM appointments a
  INNER JOIN users client ON client.id = a.client_id
  INNER JOIN barbers b ON b.id = a.barber_id
  INNER JOIN users barber_user ON barber_user.id = b.user_id
  INNER JOIN services s ON s.id = a.service_id
`;

const findAll = async () => {
  const [rows] = await pool.query(
    `${baseSelect}
     ORDER BY a.date DESC, a.time DESC`
  );

  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `${baseSelect}
     WHERE a.id = ?`,
    [id]
  );

  return rows[0];
};

const findClientById = async (clientId) => {
  const [rows] = await pool.query(
    `SELECT id, role
     FROM users
     WHERE id = ?`,
    [clientId]
  );

  return rows[0];
};

const findActiveBarberById = async (barberId) => {
  const [rows] = await pool.query(
    `SELECT id, active
     FROM barbers
     WHERE id = ? AND active = 1`,
    [barberId]
  );

  return rows[0];
};

const findActiveServiceById = async (serviceId) => {
  const [rows] = await pool.query(
    `SELECT id, price, duration_minutes, active
     FROM services
     WHERE id = ? AND active = 1`,
    [serviceId]
  );

  return rows[0];
};

const findScheduleConflict = async ({ barberId, date, time, durationMinutes }) => {
  const [rows] = await pool.query(
    `SELECT a.id
     FROM appointments a
     INNER JOIN services s ON s.id = a.service_id
     WHERE a.barber_id = ?
       AND a.date = ?
       AND a.status IN ('pendiente', 'confirmada')
       AND TIME_TO_SEC(?) < TIME_TO_SEC(a.time) + (s.duration_minutes * 60)
       AND TIME_TO_SEC(?) + (? * 60) > TIME_TO_SEC(a.time)
     LIMIT 1`,
    [barberId, date, time, time, durationMinutes]
  );

  return rows[0];
};

const create = async ({ clientId, barberId, serviceId, date, time, payment, confirmationTokenHash, confirmationExpiresAt }) => {
  const [result] = await pool.query(
    `INSERT INTO appointments
       (client_id, barber_id, service_id, date, time, status, payment, confirmation_token_hash, confirmation_expires_at)
     VALUES (?, ?, ?, ?, ?, 'pendiente', ?, ?, ?)`,
    [clientId, barberId, serviceId, date, time, payment, confirmationTokenHash, confirmationExpiresAt]
  );

  return findById(result.insertId);
};

const findByConfirmationTokenHash = async (confirmationTokenHash) => {
  const [rows] = await pool.query(
    `${baseSelect}
     WHERE a.confirmation_token_hash = ?`,
    [confirmationTokenHash]
  );

  return rows[0];
};

const updateStatusById = async (id, status) => {
  await pool.query(
    `UPDATE appointments
     SET status = ?
     WHERE id = ?`,
    [status, id]
  );

  return findById(id);
};

const confirmById = async (id, action) => {
  await pool.query(
    `UPDATE appointments
     SET status = CASE WHEN ? = 'cancel' THEN 'cancelada' ELSE status END,
         confirmation_token_hash = NULL,
         confirmation_expires_at = NULL,
         client_confirmed_at = CASE WHEN ? = 'confirm' THEN NOW() ELSE client_confirmed_at END,
         client_cancelled_at = CASE WHEN ? = 'cancel' THEN NOW() ELSE client_cancelled_at END
     WHERE id = ?`,
    [action, action, action, id]
  );

  return findById(id);
};

module.exports = {
  findAll,
  findById,
  findClientById,
  findActiveBarberById,
  findActiveServiceById,
  findScheduleConflict,
  create,
  findByConfirmationTokenHash,
  updateStatusById,
  confirmById
};
