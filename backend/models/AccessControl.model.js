const mongoose = require('mongoose');

const accessControlSchema = new mongoose.Schema({
  type: { type: String, enum: ['matrix', 'acl'], required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AccessControl', accessControlSchema);