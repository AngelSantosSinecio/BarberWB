const activityLogService = require('../services/activityLogService');

const getActivityLogs = async (req, res) => {
  const logs = await activityLogService.getActivityLogs();

  res.status(200).json({
    success: true,
    data: logs
  });
};

const getActivityLog = async (req, res) => {
  const log = await activityLogService.getActivityLogById(req.params.id);

  res.status(200).json({
    success: true,
    data: log
  });
};

const createActivityLog = async (req, res) => {
  const log = await activityLogService.createActivityLog(req.body);

  res.status(201).json({
    success: true,
    message: 'Registro de actividad creado correctamente',
    data: log
  });
};

module.exports = {
  getActivityLogs,
  getActivityLog,
  createActivityLog
};
