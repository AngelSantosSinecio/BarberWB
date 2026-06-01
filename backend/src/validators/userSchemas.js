const { z } = require('zod');

const setUserActiveSchema = z.object({
  body: z.object({
    active: z.boolean()
  })
});

module.exports = {
  setUserActiveSchema
};
