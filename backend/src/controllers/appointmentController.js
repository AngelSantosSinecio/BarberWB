const appointmentService = require('../services/appointmentService');

const getAppointments = async (req, res) => {
  const appointments = await appointmentService.getAppointments();

  res.status(200).json({
    success: true,
    data: appointments
  });
};

const getAppointment = async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(req.params.id);

  res.status(200).json({
    success: true,
    data: appointment
  });
};

const createAppointment = async (req, res) => {
  const appointment = await appointmentService.createAppointment(req.body);

  res.status(201).json({
    success: true,
    message: 'Cita creada correctamente',
    data: appointment
  });
};

const updateAppointmentStatus = async (req, res) => {
  const appointment = await appointmentService.updateAppointmentStatus(
    req.params.id,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: 'Estado de cita actualizado correctamente',
    data: appointment
  });
};

const confirmAppointmentByEmail = async (req, res) => {
  const appointment = await appointmentService.confirmAppointmentByEmail(req.body);
  const message = req.body.action === 'confirm'
    ? 'Solicitud de cita aceptada. Queda pendiente de confirmacion del negocio'
    : 'Cita cancelada correctamente';

  res.status(200).json({
    success: true,
    message,
    data: appointment
  });
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointmentStatus,
  confirmAppointmentByEmail
};
