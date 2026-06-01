const serviceService = require('../services/serviceService');

const getServices = async (req, res) => {
  const services = await serviceService.getActiveServices();

  res.status(200).json({
    success: true,
    data: services
  });
};

const getService = async (req, res) => {
  const service = await serviceService.getServiceById(req.params.id);

  res.status(200).json({
    success: true,
    data: service
  });
};

const createService = async (req, res) => {
  const service = await serviceService.createService(req.body);

  res.status(201).json({
    success: true,
    message: 'Servicio creado correctamente',
    data: service
  });
};

const updateService = async (req, res) => {
  const service = await serviceService.updateService(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Servicio actualizado correctamente',
    data: service
  });
};

const deleteService = async (req, res) => {
  const service = await serviceService.deleteService(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Servicio desactivado correctamente',
    data: service
  });
};

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
};
