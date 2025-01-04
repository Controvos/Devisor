const mongoose = require('mongoose');

// Define the schema for the User model
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
  },
  servers: [
    {
      serverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server',
      },
      serverName: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ['active', 'suspended', 'terminated'],
        default: 'active',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, {
  timestamps: true,
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
