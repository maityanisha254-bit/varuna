const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Worker name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Phone number must be 10 digits'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    designation: {
      type: String,
      enum: ['Drainage Technician', 'Sanitation Worker', 'Field Supervisor', 'Pump Operator', 'Engineer'],
      default: 'Drainage Technician',
    },
    ward: {
      type: String,
      required: [true, 'Assigned ward is required'],
      trim: true,
    },
    zone: { type: String, trim: true, default: 'North' },
    status: {
      type: String,
      enum: ['available', 'on-duty', 'off-duty'],
      default: 'available',
    },
    activeComplaints: {
      type: Number,
      default: 0,
    },
    resolvedCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Worker', workerSchema);
