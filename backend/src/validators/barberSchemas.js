const { z } = require('zod');

const barberBodySchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  email: z.string().email('El correo no tiene un formato valido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  phone: z.string().trim().min(1, 'El telefono es obligatorio'),
  specialties: z.string().trim().nullable().optional(),
  scheduleStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Horario inicial invalido').default('09:00:00'),
  scheduleEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Horario final invalido').default('18:00:00')
});

const createBarberSchema = z.object({
  body: barberBodySchema.extend({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').default('123456')
  })
});

const updateBarberSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('El id debe ser un numero positivo')
  }),
  body: barberBodySchema
});

module.exports = {
  createBarberSchema,
  updateBarberSchema
};
