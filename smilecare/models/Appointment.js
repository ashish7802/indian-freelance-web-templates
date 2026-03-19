const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^(\+91[\-\s]?)?[6-9]\d{9}$/, 'Please enter a valid Indian phone number'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    service: {
      type: String,
      required: [true, 'Service selection is required'],
      trim: true,
      maxlength: 120,
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    preferredTime: {
      type: String,
      required: [true, 'Preferred time is required'],
      trim: true,
      maxlength: 40,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    confirmationEmailSent: {
      type: Boolean,
      default: false,
    },
    confirmationSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ appointmentDate: 1, status: 1 });
appointmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
