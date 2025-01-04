const mongoose = require('mongoose');


const ServerSchema = new mongoose.Schema({
  serverName: {
    type: String,
    required: true,
    trim: true,
  },
  serverType: {
    type: String,
    enum: ['VPS', 'Game Server', 'Minecraft', 'FiveM', 'Ark'],
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'terminated'],
    default: 'active',
  },
  ipAddress: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Server = mongoose.model('Server', ServerSchema);

module.exports = Server;
