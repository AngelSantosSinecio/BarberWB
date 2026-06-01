require('dotenv').config();

const nodemailer = require('nodemailer');

const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
const missingVars = requiredVars.filter((name) => !process.env[name]);

if (missingVars.length) {
  console.error(`Faltan variables SMTP: ${missingVars.join(', ')}`);
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const run = async () => {
  await transporter.verify();
  console.log('Conexion SMTP correcta');

  const to = process.argv[2] || process.env.SMTP_USER;
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'Prueba de correo BarberApp',
    text: 'Si recibes este mensaje, el SMTP de BarberApp esta configurado correctamente.'
  });

  console.log(`Correo de prueba enviado a ${to}: ${info.messageId}`);
};

run().catch((error) => {
  console.error('No se pudo enviar el correo de prueba:', error.message);
  process.exit(1);
});
