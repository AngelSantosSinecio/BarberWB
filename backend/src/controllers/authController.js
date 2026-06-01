const authService = require('../services/authService');

const login = async (req, res) => {
  const result = await authService.login(req.body);

  res.status(200).json({
    success: true,
    message: 'Inicio de sesion correcto',
    data: result
  });
};

const register = async (req, res) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: 'Registro correcto. Revisa tu correo para confirmar tu cuenta',
    data: result
  });
};

const verifyEmail = async (req, res) => {
  const result = await authService.verifyEmail(req.body);

  res.status(200).json({
    success: true,
    message: 'Correo confirmado correctamente',
    data: result
  });
};

module.exports = {
  login,
  register,
  verifyEmail
};
