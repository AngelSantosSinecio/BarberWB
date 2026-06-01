const crypto = require('crypto');

const appointmentModel = require('../models/appointmentModel');
const AppError = require('../utils/AppError');
const emailService = require('./emailService');

const TOKEN_TTL_HOURS = 48;

const getAppointments = async () => {
  return appointmentModel.findAll();
};

const getAppointmentById = async (id) => {
  const appointment = await appointmentModel.findById(id);

  if (!appointment) {
    throw new AppError('Cita no encontrada', 404);
  }

  return appointment;
};

const isValidDate = (date) => {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
};

const isValidTime = (time) => {
  return typeof time === 'string' && /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(time);
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const createConfirmationUrl = (token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';
  return `${clientUrl}/appointments/confirm?token=${encodeURIComponent(token)}`;
};

const createAppointment = async ({ clientId, barberId, serviceId, date, time, payment = 0 }) => {
  if (!Number.isInteger(clientId)) {
    throw new AppError('El clientId es obligatorio y debe ser numerico', 400);
  }

  if (!Number.isInteger(barberId)) {
    throw new AppError('El barberId es obligatorio y debe ser numerico', 400);
  }

  if (!Number.isInteger(serviceId)) {
    throw new AppError('El serviceId es obligatorio y debe ser numerico', 400);
  }

  if (!isValidDate(date)) {
    throw new AppError('La fecha debe tener formato YYYY-MM-DD', 400);
  }

  if (!isValidTime(time)) {
    throw new AppError('La hora debe tener formato HH:mm o HH:mm:ss', 400);
  }

  if (typeof payment !== 'number' || payment < 0) {
    throw new AppError('El pago debe ser un numero mayor o igual a 0', 400);
  }

  const client = await appointmentModel.findClientById(clientId);

  if (!client || client.role !== 'cliente') {
    throw new AppError('Cliente no encontrado', 404);
  }

  const barber = await appointmentModel.findActiveBarberById(barberId);

  if (!barber) {
    throw new AppError('Barbero no encontrado o inactivo', 404);
  }

  const service = await appointmentModel.findActiveServiceById(serviceId);

  if (!service) {
    throw new AppError('Servicio no encontrado o inactivo', 404);
  }

  const conflict = await appointmentModel.findScheduleConflict({
    barberId,
    date,
    time,
    durationMinutes: service.duration_minutes
  });

  if (conflict) {
    throw new AppError('El barbero ya tiene una cita que se cruza con ese horario', 409);
  }

  const token = crypto.randomBytes(32).toString('hex');
  const confirmationExpiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  const appointment = await appointmentModel.create({
    clientId,
    barberId,
    serviceId,
    date,
    time,
    payment,
    confirmationTokenHash: hashToken(token),
    confirmationExpiresAt
  });

  console.log(`[BarberApp] Cita ${appointment.id} creada. Enviando confirmacion a ${appointment.client_email}`);

  try {
    await emailService.sendAppointmentConfirmationEmail({
      to: appointment.client_email,
      clientName: appointment.client_name,
      date: appointment.date,
      time: appointment.time,
      serviceName: appointment.service_name,
      barberName: appointment.barber_name,
      confirmationUrl: createConfirmationUrl(token)
    });
  } catch (error) {
    console.error('[BarberApp] No se pudo enviar el correo de confirmacion:', error.message);
  }

  return appointment;
};

const updateAppointmentStatus = async (id, status) => {
  const validStatuses = ['pendiente', 'confirmada', 'rechazada', 'cancelada'];

  await getAppointmentById(id);

  if (!validStatuses.includes(status)) {
    throw new AppError('Estado de cita invalido', 400);
  }

  return appointmentModel.updateStatusById(id, status);
};

const confirmAppointmentByEmail = async ({ token, action }) => {
  if (!token) {
    throw new AppError('Token de confirmacion requerido', 400);
  }

  const appointment = await appointmentModel.findByConfirmationTokenHash(hashToken(token));

  if (!appointment) {
    throw new AppError('Enlace de confirmacion invalido o ya utilizado', 404);
  }

  if (appointment.confirmation_expires_at && new Date(appointment.confirmation_expires_at) < new Date()) {
    throw new AppError('El enlace de confirmacion expiro', 410);
  }

  if (!['confirm', 'cancel'].includes(action)) {
    throw new AppError('Accion de confirmacion invalida', 400);
  }

  if (!['pendiente', 'confirmada'].includes(appointment.status) && action === 'cancel') {
    throw new AppError('Esta cita ya no puede cancelarse por correo', 409);
  }

  if (appointment.status !== 'pendiente' && action === 'confirm') {
    throw new AppError('Esta cita ya no puede confirmarse por correo', 409);
  }

  return appointmentModel.confirmById(appointment.id, action);
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  confirmAppointmentByEmail
};
