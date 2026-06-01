const pool = require('../config/database');

const findAllActive = async () => {
  const [rows] = await pool.query(
    `SELECT id, name, duration_minutes, price, active
     FROM services
     WHERE active = 1
     ORDER BY name ASC`
  );

  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, name, duration_minutes, price, active
     FROM services
     WHERE id = ?`,
    [id]
  );

  return rows[0];
};

const create = async ({ name, durationMinutes, price }) => {
  const [result] = await pool.query(
    `INSERT INTO services (name, duration_minutes, price, active)
     VALUES (?, ?, ?, 1)`,
    [name, durationMinutes, price]
  );

  return findById(result.insertId);
};

const updateById = async (id, { name, durationMinutes, price, active }) => {
  await pool.query(
    `UPDATE services
     SET name = ?, duration_minutes = ?, price = ?, active = ?
     WHERE id = ?`,
    [name, durationMinutes, price, active, id]
  );

  return findById(id);
};

const deactivateById = async (id) => {
  await pool.query(
    `UPDATE services
     SET active = 0
     WHERE id = ?`,
    [id]
  );

  return findById(id);
};

module.exports = {
  findAllActive,
  findById,
  create,
  updateById,
  deactivateById
};
