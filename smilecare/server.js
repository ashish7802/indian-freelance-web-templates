require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const appointmentsRouter = require('./routes/appointments');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smilecare';

const createMailer = () => {
  const hasSmtpConfig = Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.MAIL_FROM
  );

  const transport = hasSmtpConfig
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });

  return {
    async sendAppointmentConfirmation(appointment) {
      const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const mailOptions = {
        from: process.env.MAIL_FROM || 'SmileCare Dental Clinic <no-reply@smilecaredental.in>',
        to: appointment.email,
        subject: 'SmileCare Dental Clinic | Appointment Request Received',
        html: `
          <div style="font-family: Poppins, Arial, sans-serif; background:#f4f9ff; padding:24px; color:#15314b;">
            <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:20px; padding:32px; border:1px solid rgba(13,110,253,0.12);">
              <h2 style="margin:0 0 16px; color:#0d6efd;">SmileCare Dental Clinic</h2>
              <p style="margin:0 0 12px;">Dear ${appointment.fullName},</p>
              <p style="margin:0 0 12px;">Thank you for booking with <strong>SmileCare Dental Clinic</strong>. We have received your appointment request.</p>
              <div style="background:#eef6ff; border-radius:16px; padding:18px; margin:20px 0;">
                <p style="margin:0 0 8px;"><strong>Service:</strong> ${appointment.service}</p>
                <p style="margin:0 0 8px;"><strong>Date:</strong> ${appointmentDate}</p>
                <p style="margin:0;"><strong>Preferred Time:</strong> ${appointment.preferredTime}</p>
              </div>
              <p style="margin:0 0 12px;">Hamari team aapse jaldi contact karegi to confirm the exact appointment slot.</p>
              <p style="margin:0 0 12px;">For urgent support, call us at ${process.env.CLINIC_PHONE || '+91 98765 43210'}.</p>
              <p style="margin:20px 0 0;">Aapki Smile, Hamari Zimmedari.<br/>Team SmileCare</p>
            </div>
          </div>
        `,
      };

      const info = await transport.sendMail(mailOptions);
      if (!hasSmtpConfig) {
        console.log('Email transport running in local preview mode. Message preview:\n', info.message.toString());
      }
      return { mode: hasSmtpConfig ? 'smtp' : 'preview' };
    },
  };
};

app.locals.mailer = createMailer();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', appointmentsRouter);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

app.get('/health', async (_req, res) => {
  const mongooseState = mongoose.connection.readyState;
  res.json({
    success: true,
    status: 'ok',
    database:
      mongooseState === 1
        ? 'connected'
        : mongooseState === 2
          ? 'connecting'
          : 'disconnected',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
  });
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`SmileCare server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
