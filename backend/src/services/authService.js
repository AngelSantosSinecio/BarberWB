const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');
const emailService = require('./emailService');

const EMAIL_TOKEN_TTL_HOURS = 24;

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  active: Boolean(user.active),
  email_verified: Boolean(user.email_verified),
  created_at: user.created_at
});

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const createEmailVerificationUrl = (token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';
  return `${clientUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;
};

const login = async ({ email, password }) => {
  const user = await userModel.findByEmailWithPassword(email);

  if (!user) {
    throw new AppError('Credenciales incorrectas', 401);
  }

  const isHashedPassword = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
  const passwordMatches = isHashedPassword
    ? await bcrypt.compare(password, user.password)
    : password === user.password;

  if (!passwordMatches) {
    throw new AppError('Credenciales incorrectas', 401);
  }

  if (!user.active) {
    throw new AppError('Tu cuenta esta bloqueada. Contacta al administrador', 403);
  }

  if (user.role === 'cliente' && !user.email_verified) {
    throw new AppError('Confirma tu correo electronico antes de iniciar sesion', 403);
  }

  if (!isHashedPassword) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.updatePasswordById(user.id, hashedPassword);
  }

  return {
    token: signToken(user),
    user: sanitizeUser(user)
  };
};

const register = async ({ name, email, phone, password }) => {
  const existingUser = await userModel.findByEmailWithPassword(email);

  if (existingUser) {
    throw new AppError('Este correo ya esta registrado', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpiresAt = new Date(Date.now() + EMAIL_TOKEN_TTL_HOURS * 60 * 60 * 1000);

  const user = await userModel.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: 'cliente',
    emailVerified: 0,
    emailVerificationTokenHash: hashToken(emailVerificationToken),
    emailVerificationExpiresAt
  });

  try {
    await emailService.sendEmailVerificationEmail({
      to: user.email,
      name: user.name,
      verificationUrl: createEmailVerificationUrl(emailVerificationToken)
    });
  } catch (error) {
    console.error('[BarberApp] No se pudo enviar el correo de verificacion:', error.message);
  }

  return {
    emailVerificationRequired: true,
    user: sanitizeUser(user)
  };
};

const verifyEmail = async ({ token }) => {
  if (!token) {
    throw new AppError('Token de verificacion requerido', 400);
  }

  const user = await userModel.findByEmailVerificationTokenHash(hashToken(token));

  if (!user) {
    throw new AppError('Enlace de verificacion invalido o ya utilizado', 404);
  }

  if (user.email_verification_expires_at && new Date(user.email_verification_expires_at) < new Date()) {
    throw new AppError('El enlace de verificacion expiro', 410);
  }

  return {
    user: sanitizeUser(await userModel.verifyEmailById(user.id))
  };
};

module.exports = {
  login,
  register,
  verifyEmail
};
