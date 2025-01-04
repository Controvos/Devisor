const mongoose = require('mongoose');


const nodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  ipAddress: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});


nodeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});


const Node = mongoose.model('Node', nodeSchema);

module.exports = Node;
