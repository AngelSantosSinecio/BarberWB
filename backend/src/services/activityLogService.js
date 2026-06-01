const activityLogModel = require('../models/activityLogModel');
const AppError = require('../utils/AppError');

const validActions = ['creación', 'cancelación', 'edición', 'login', 'logout'];

const getActivityLogs = async () => {
  return activityLogModel.findAll();
};

const getActivityLogById = async (id) => {
  const log = await activityLogModel.findById(id);

  if (!log) {
    throw new AppError('Registro de actividad no encontrado', 404);
  }

  return log;
};

const createActivityLog = async ({ action, entity, entityId = null, userId = null, details = null }) => {
  if (!validActions.includes(action)) {
    throw new AppError('Accion de actividad invalida', 400);
  }

  if (!entity || typeof entity !== 'string' || !entity.trim()) {
    throw new AppError('La entidad es obligatoria', 400);
  }

  if (entityId !== null && !Number.isInteger(entityId)) {
    throw new AppError('El entityId debe ser numerico', 400);
  }

  if (userId !== null && !Number.isInteger(userId)) {
    throw new AppError('El userId debe ser numerico', 400);
  }

  if (details !== null && typeof details !== 'string') {
    throw new AppError('Los detalles deben ser texto', 400);
  }

  return activityLogModel.create({
    action,
    entity: entity.trim(),
    entityId,
    userId,
    details
  });
};

module.exports = {
  getActivityLogs,
  getActivityLogById,
  createActivityLog
};
