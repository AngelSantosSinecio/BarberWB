const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');

const validRoles = ['admin', 'barbero', 'cliente'];

const getUsers = async (role) => {
  if (role && !validRoles.includes(role)) {
    throw new AppError('Rol de usuario invalido', 400);
  }

  return userModel.findAll(role);
};

const getUserById = async (id) => {
  const user = await userModel.findById(id);

  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  return user;
};

const setUserActive = async (id, active, currentUserId) => {
  const user = await getUserById(id);

  if (Number(user.id) === Number(currentUserId)) {
    throw new AppError('No puedes bloquear o desbloquear tu propia cuenta', 400);
  }

  return userModel.setActiveById(id, active);
};

const deleteUser = async (id, currentUserId) => {
  const user = await getUserById(id);

  if (Number(user.id) === Number(currentUserId)) {
    throw new AppError('No puedes eliminar tu propia cuenta', 400);
  }

  await userModel.deleteById(id);
  return user;
};

module.exports = {
  getUsers,
  getUserById,
  setUserActive,
  deleteUser
};
