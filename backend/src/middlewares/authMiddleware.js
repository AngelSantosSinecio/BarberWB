const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/jwt');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token de autenticacion requerido', 401));
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return next(new AppError('Usuario del token no encontrado', 401));
    }

    if (!user.active) {
      return next(new AppError('Tu cuenta esta bloqueada. Contacta al administrador', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Token invalido o expirado', 401));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('No tienes permisos para realizar esta accion', 403));
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
