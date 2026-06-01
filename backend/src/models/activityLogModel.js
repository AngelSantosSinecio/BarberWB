const pool = require('../config/database');

const baseSelect = `
  SELECT
    al.id,
    al.action,
    al.entity,
    al.entity_id,
    al.user_id,
    u.name AS user_name,
    al.details,
    al.timestamp
  FROM activity_logs al
  LEFT JOIN users u ON u.id = al.user_id
`;

const findAll = async () => {
  const [rows] = await pool.query(
    `${baseSelect}
     ORDER BY al.timestamp DESC`
  );

  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `${baseSelect}
     WHERE al.id = ?`,
    [id]
  );

  return rows[0];
};

const create = async ({ action, entity, entityId, userId, details }) => {
  const [result] = await pool.query(
    `INSERT INTO activity_logs
       (action, entity, entity_id, user_id, details)
     VALUES (?, ?, ?, ?, ?)`,
    [action, entity, entityId, userId, details]
  );

  return findById(result.insertId);
};

module.exports = {
  findAll,
  findById,
  create
};
