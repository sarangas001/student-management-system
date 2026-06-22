const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const aiAssistentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'userRole' },
  userRole: { type: String, required: true, enum: ['Student', 'Teacher', 'Admin'] },
  messages: [messageSchema],
  sessionStartedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const AIAssistent = mongoose.model('AIAssistent', aiAssistentSchema);
module.exports = AIAssistent;