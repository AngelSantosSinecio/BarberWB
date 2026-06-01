const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('El correo no tiene un formato valido'),
    password: z.string().min(1, 'La contrasena es obligatoria')
  })
});

const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().trim().email('El correo no tiene un formato valido'),
    phone: z.string().trim().min(8, 'El telefono es obligatorio'),
    password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres')
  })
});

const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(20, 'Token de verificacion invalido')
  })
});

module.exports = {
  loginSchema,
  registerSchema,
  verifyEmailSchema
};
