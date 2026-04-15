const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  ip: { type: String },
  count: { type: Number },
  severity: { type: String, enum: ['warning', 'critical'], required: true },
  timestamp: { type: Date, default: Date.now }
});

AlertSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Alert', AlertSchema);
