const { z } = require('zod');

const createAppointmentSchema = z.object({
  body: z.object({
    clientId: z.coerce.number().int().positive('El clientId debe ser numerico'),
    barberId: z.coerce.number().int().positive('El barberId debe ser numerico'),
    serviceId: z.coerce.number().int().positive('El serviceId debe ser numerico'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD'),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'La hora debe tener formato HH:mm o HH:mm:ss'),
    payment: z.coerce.number().min(0, 'El pago debe ser mayor o igual a 0').default(0)
  })
});

const updateAppointmentStatusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('El id debe ser un numero positivo')
  }),
  body: z.object({
    status: z.enum(['pendiente', 'confirmada', 'rechazada', 'cancelada'], {
      message: 'Estado de cita invalido'
    })
  })
});

const confirmAppointmentByEmailSchema = z.object({
  body: z.object({
    token: z.string().min(20, 'Token de confirmacion invalido'),
    action: z.enum(['confirm', 'cancel'], {
      message: 'Accion de confirmacion invalida'
    })
  })
});

module.exports = {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  confirmAppointmentByEmailSchema
};
