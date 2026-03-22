const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointments');

router.post('/appointments', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    await req.app.locals.mailer.sendAppointmentConfirmation(appointment);
    res.json({ success: true, message: 'Appointment booked successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

module.exports = router;
