const pool = require('../config/database');

const baseSelect = `
  SELECT id, name, email, role, phone, active, email_verified, email_verification_expires_at, email_verified_at, created_at
  FROM users
`;

const findAll = async (role) => {
  if (role) {
    const [rows] = await pool.query(
      `${baseSelect}
       WHERE role = ?
       ORDER BY name ASC`,
      [role]
    );

    return rows;
  }

  const [rows] = await pool.query(
    `${baseSelect}
     ORDER BY name ASC`
  );

  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `${baseSelect}
     WHERE id = ?`,
    [id]
  );

  return rows[0];
};

const findByEmailWithPassword = async (email) => {
  const [rows] = await pool.query(
    `SELECT id, name, email, password, role, phone, active, email_verified, email_verified_at, created_at
     FROM users
     WHERE email = ?`,
    [email]
  );

  return rows[0];
};

const updatePasswordById = async (id, password) => {
  await pool.query(
    `UPDATE users
     SET password = ?
     WHERE id = ?`,
    [password, id]
  );
};

const create = async ({ name, email, password, role, phone, emailVerified = 1, emailVerificationTokenHash = null, emailVerificationExpiresAt = null }) => {
  const [result] = await pool.query(
    `INSERT INTO users
       (name, email, password, role, phone, email_verified, email_verification_token_hash, email_verification_expires_at, email_verified_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 1 THEN NOW() ELSE NULL END)`,
    [name, email, password, role, phone, emailVerified, emailVerificationTokenHash, emailVerificationExpiresAt, emailVerified]
  );

  return findById(result.insertId);
};

const findByEmailVerificationTokenHash = async (emailVerificationTokenHash) => {
  const [rows] = await pool.query(
    `${baseSelect}
     WHERE email_verification_token_hash = ?`,
    [emailVerificationTokenHash]
  );

  return rows[0];
};

const verifyEmailById = async (id) => {
  await pool.query(
    `UPDATE users
     SET email_verified = 1,
         email_verified_at = NOW(),
         email_verification_token_hash = NULL,
         email_verification_expires_at = NULL
     WHERE id = ?`,
    [id]
  );

  return findById(id);
};

const updateById = async (id, { name, email, role, phone }) => {
  await pool.query(
    `UPDATE users
     SET name = ?, email = ?, role = ?, phone = ?
     WHERE id = ?`,
    [name, email, role, phone, id]
  );

  return findById(id);
};

const setActiveById = async (id, active) => {
  await pool.query(
    `UPDATE users
     SET active = ?
     WHERE id = ?`,
    [active ? 1 : 0, id]
  );

  return findById(id);
};

const deleteById = async (id) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [users] = await connection.query(
      `SELECT id, role
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (!users.length) {
      await connection.rollback();
      return null;
    }

    const user = users[0];
    await connection.query(`DELETE FROM activity_logs WHERE user_id = ?`, [id]);

    if (user.role === 'barbero') {
      const [barbers] = await connection.query(
        `SELECT id
         FROM barbers
         WHERE user_id = ?`,
        [id]
      );
      const barberIds = barbers.map((barber) => barber.id);

      if (barberIds.length) {
        await connection.query(`DELETE FROM appointments WHERE barber_id IN (?)`, [barberIds]);
        await connection.query(`DELETE FROM barbers WHERE id IN (?)`, [barberIds]);
      }
    }

    await connection.query(`DELETE FROM appointments WHERE client_id = ?`, [id]);
    await connection.query(`DELETE FROM users WHERE id = ?`, [id]);

    await connection.commit();
    return user;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  findAll,
  findById,
  findByEmailWithPassword,
  findByEmailVerificationTokenHash,
  updatePasswordById,
  create,
  verifyEmailById,
  updateById,
  setActiveById,
  deleteById
};
