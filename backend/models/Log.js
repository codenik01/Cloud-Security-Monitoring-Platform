const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  user: { type: String, default: 'anonymous' },
  event: { type: String, required: true },
  ip: { type: String, required: true },
  source: { type: String, default: 'unknown' },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

// Index for fast quering
LogSchema.index({ timestamp: -1 });
LogSchema.index({ ip: 1 });
LogSchema.index({ event: 1 });

module.exports = mongoose.model('Log', LogSchema);
