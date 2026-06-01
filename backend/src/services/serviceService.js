const serviceModel = require('../models/serviceModel');
const AppError = require('../utils/AppError');

const getActiveServices = async () => {
  return serviceModel.findAllActive();
};

const getServiceById = async (id) => {
  const service = await serviceModel.findById(id);

  if (!service) {
    throw new AppError('Servicio no encontrado', 404);
  }

  return service;
};

const validateServiceData = ({ name, durationMinutes, price }) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new AppError('El nombre del servicio es obligatorio', 400);
  }

  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    throw new AppError('La duracion debe ser un numero entero mayor a 0', 400);
  }

  if (typeof price !== 'number' || price <= 0) {
    throw new AppError('El precio debe ser un numero mayor a 0', 400);
  }
};

const createService = async ({ name, durationMinutes, price }) => {
  validateServiceData({ name, durationMinutes, price });

  return serviceModel.create({
    name: name.trim(),
    durationMinutes,
    price
  });
};

const updateService = async (id, { name, durationMinutes, price, active }) => {
  await getServiceById(id);
  validateServiceData({ name, durationMinutes, price });

  if (typeof active !== 'boolean') {
    throw new AppError('El estado active debe ser verdadero o falso', 400);
  }

  return serviceModel.updateById(id, {
    name: name.trim(),
    durationMinutes,
    price,
    active
  });
};

const deleteService = async (id) => {
  await getServiceById(id);

  return serviceModel.deactivateById(id);
};

module.exports = {
  getActiveServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};
