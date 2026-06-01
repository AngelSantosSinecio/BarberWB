const barberModel = require('../models/barberModel');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');

const getActiveBarbers = async () => {
  return barberModel.findAllActive();
};

const getBarberById = async (id) => {
  const barber = await barberModel.findById(id);

  if (!barber) {
    throw new AppError('Barbero no encontrado', 404);
  }

  return barber;
};

const createBarber = async ({ name, email, password, phone, specialties = null, scheduleStart, scheduleEnd }) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    return await barberModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      specialties,
      scheduleStart,
      scheduleEnd
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('El correo ya esta registrado', 409);
    }

    throw error;
  }
};

const updateBarber = async (id, data) => {
  await getBarberById(id);

  try {
    return await barberModel.updateById(id, data);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('El correo ya esta registrado', 409);
    }

    throw error;
  }
};

const deleteBarber = async (id) => {
  await getBarberById(id);

  return barberModel.deactivateById(id);
};

module.exports = {
  getActiveBarbers,
  getBarberById,
  createBarber,
  updateBarber,
  deleteBarber
};
