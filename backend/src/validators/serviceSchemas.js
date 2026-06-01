const { z } = require('zod');

const serviceBodySchema = z.object({
  name: z.string().trim().min(1, 'El nombre del servicio es obligatorio'),
  durationMinutes: z.coerce.number().int().positive('La duracion debe ser mayor a 0'),
  price: z.coerce.number().positive('El precio debe ser mayor a 0')
});

const createServiceSchema = z.object({
  body: serviceBodySchema
});

const updateServiceSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('El id debe ser un numero positivo')
  }),
  body: serviceBodySchema.extend({
    active: z.boolean('El estado active debe ser verdadero o falso')
  })
});

module.exports = {
  createServiceSchema,
  updateServiceSchema
};
