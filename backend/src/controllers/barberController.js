const barberService = require('../services/barberService');

const getBarbers = async (req, res) => {
  const barbers = await barberService.getActiveBarbers();

  res.status(200).json({
    success: true,
    data: barbers
  });
};

const getBarber = async (req, res) => {
  const barber = await barberService.getBarberById(req.params.id);

  res.status(200).json({
    success: true,
    data: barber
  });
};

const createBarber = async (req, res) => {
  const barber = await barberService.createBarber(req.body);

  res.status(201).json({
    success: true,
    message: 'Barbero creado correctamente',
    data: barber
  });
};

const updateBarber = async (req, res) => {
  const barber = await barberService.updateBarber(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Barbero actualizado correctamente',
    data: barber
  });
};

const deleteBarber = async (req, res) => {
  const barber = await barberService.deleteBarber(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Barbero desactivado correctamente',
    data: barber
  });
};

module.exports = {
  getBarbers,
  getBarber,
  createBarber,
  updateBarber,
  deleteBarber
};
