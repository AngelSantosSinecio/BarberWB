const nodemailer = require('nodemailer');

const hasSmtpConfig = () => Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

const createTransport = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendAppointmentConfirmationEmail = async ({ to, clientName, date, time, serviceName, barberName, confirmationUrl }) => {
  const subject = 'Confirma tu cita en BarberApp';
  const text = [
    `Hola ${clientName},`,
    '',
    'Tu cita fue registrada y necesita confirmacion por correo.',
    `Servicio: ${serviceName}`,
    `Barbero: ${barberName}`,
    `Fecha y hora: ${date} a las ${time}`,
    '',
    `Abre este enlace para aceptar o cancelar tu cita: ${confirmationUrl}`,
    '',
    'Si no solicitaste esta cita, puedes ignorar este mensaje.'
  ].join('\n');

  if (!hasSmtpConfig()) {
    console.log('[BarberApp] SMTP no configurado. Enlace de confirmacion de cita:');
    console.log(confirmationUrl);
    return;
  }

  const transporter = createTransport();
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text
  });

  console.log(`[BarberApp] Correo de confirmacion enviado a ${to}: ${info.messageId}`);
};

const sendEmailVerificationEmail = async ({ to, name, verificationUrl }) => {
  const subject = 'Confirma tu correo en BarberApp';
  const text = [
    `Hola ${name},`,
    '',
    'Gracias por registrarte en BarberApp.',
    'Para activar tu cuenta y evitar correos incorrectos, confirma tu correo electronico.',
    '',
    `Abre este enlace para confirmar tu correo: ${verificationUrl}`,
    '',
    'Si no creaste esta cuenta, puedes ignorar este mensaje.'
  ].join('\n');

  if (!hasSmtpConfig()) {
    console.log('[BarberApp] SMTP no configurado. Enlace de verificacion de correo:');
    console.log(verificationUrl);
    return;
  }

  const transporter = createTransport();
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text
  });

  console.log(`[BarberApp] Correo de verificacion enviado a ${to}: ${info.messageId}`);
};

module.exports = {
  sendAppointmentConfirmationEmail,
  sendEmailVerificationEmail
};
