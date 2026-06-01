const { z } = require('zod');

const createActivityLogSchema = z.object({
  body: z.object({
    action: z.enum(['creación', 'cancelación', 'edición', 'login', 'logout'], {
      message: 'Accion de actividad invalida'
    }),
    entity: z.string().trim().min(1, 'La entidad es obligatoria'),
    entityId: z.coerce.number().int().positive().nullable().optional(),
    userId: z.coerce.number().int().positive().nullable().optional(),
    details: z.string().nullable().optional()
  })
});

module.exports = {
  createActivityLogSchema
};
