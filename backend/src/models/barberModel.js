const pool = require('../config/database');

const baseSelect = `
  SELECT
    b.id,
    b.user_id,
    u.name,
    u.email,
    u.phone,
    b.specialties,
    b.schedule_start,
    b.schedule_end,
    b.active
  FROM barbers b
  INNER JOIN users u ON u.id = b.user_id
`;

const findAllActive = async () => {
  const [rows] = await pool.query(
    `${baseSelect}
     WHERE b.active = 1
     ORDER BY u.name ASC`
  );

  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `${baseSelect}
     WHERE b.id = ?`,
    [id]
  );

  return rows[0];
};

const create = async ({ name, email, password, phone, specialties, scheduleStart, scheduleEnd }) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [userResult] = await connection.query(
      `INSERT INTO users (name, email, password, role, phone)
       VALUES (?, ?, ?, 'barbero', ?)`,
      [name, email, password, phone]
    );

    const [barberResult] = await connection.query(
      `INSERT INTO barbers (user_id, specialties, schedule_start, schedule_end, active)
       VALUES (?, ?, ?, ?, 1)`,
      [userResult.insertId, specialties, scheduleStart, scheduleEnd]
    );

    await connection.commit();
    return findById(barberResult.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateById = async (id, { name, email, phone, specialties, scheduleStart, scheduleEnd }) => {
  const barber = await findById(id);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE users
       SET name = ?, email = ?, phone = ?
       WHERE id = ?`,
      [name, email, phone, barber.user_id]
    );

    await connection.query(
      `UPDATE barbers
       SET specialties = ?, schedule_start = ?, schedule_end = ?
       WHERE id = ?`,
      [specialties, scheduleStart, scheduleEnd, id]
    );

    await connection.commit();
    return findById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deactivateById = async (id) => {
  await pool.query(
    `UPDATE barbers
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
