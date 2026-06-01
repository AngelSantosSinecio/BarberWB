const { z } = require('zod');

const idParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('El id debe ser un numero positivo')
  })
});

module.exports = {
  idParamSchema
};
