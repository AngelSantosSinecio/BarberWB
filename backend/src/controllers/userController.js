const userService = require('../services/userService');

const getUsers = async (req, res) => {
  const users = await userService.getUsers(req.query.role);

  res.status(200).json({
    success: true,
    data: users
  });
};

const getUser = async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  res.status(200).json({
    success: true,
    data: user
  });
};

const setUserActive = async (req, res) => {
  const user = await userService.setUserActive(req.params.id, req.body.active, req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
};

const deleteUser = async (req, res) => {
  const user = await userService.deleteUser(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
};

module.exports = {
  getUsers,
  getUser,
  setUserActive,
  deleteUser
};
