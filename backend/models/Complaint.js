const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
      // [longitude, latitude]
      type: [Number],
      required: true,
      validate: {
        validator: (val) => Array.isArray(val) && val.length === 2,
        message: 'Coordinates must be an array of [longitude, latitude]',
      },
    },
    address: { type: String, trim: true, default: '' },
    ward: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'assigned', 'in-progress', 'resolved', 'rejected'],
      required: true,
    },
    note: { type: String, trim: true, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintCode: {
      type: String,
      unique: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Waterlogging',
        'Drain Blockage',
        'Sewage Overflow',
        'Pothole with Water Accumulation',
        'Broken Drain Cover',
        'Illegal Dumping in Drain',
        'Other',
      ],
      required: [true, 'Category is required'],
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: [true, 'Severity is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description must be under 1000 characters'],
    },
    photo: {
      type: String, // stored filename / relative path
      default: '',
    },
    location: {
      type: locationSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'assigned', 'in-progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      default: null,
    },
    assignedAt: { type: Date },
    resolvedAt: { type: Date },
    resolutionNote: { type: String, trim: true, default: '' },
    resolutionPhoto: { type: String, default: '' },
    timeline: [timelineEntrySchema],
    upvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ citizen: 1 });

complaintSchema.pre('save', function generateCode(next) {
  if (!this.complaintCode) {
    const random = Math.floor(1000 + Math.random() * 9000);
    this.complaintCode = `VRN-${Date.now().toString().slice(-6)}${random}`;
  }
  if (this.isNew) {
    this.timeline.push({ status: this.status, note: 'Complaint filed by citizen' });
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
