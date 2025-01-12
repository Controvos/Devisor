const mongoose = require("mongoose");

const ServerSchema = new mongoose.Schema({
  serverName: {
    type: String,
    required: true,
    trim: true,
  },
  serverType: {
    type: String,
    enum: ["VPS", "Game Server", "Minecraft", "FiveM", "Ark"],
    required: true,
  },
  dockerImage: {
    type: String,
    required: true,
    trim: true,
  },
  nodeName: {
    type: String,
    required: true,
    trim: true,
  },
  ipAddress: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: [
      "active",
      "suspended",
      "terminated",
      "installing",
      "ready",
      "failed",
    ],
    default: "active",
  },
  dockerContainerId: {
    type: String,
    default: null,
  },
  dockerContainerState: {
    type: String,
    enum: ["UNKNOWN", "INSTALLING", "READY", "FAILED"],
    default: "UNKNOWN",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Server = mongoose.model("Server", ServerSchema);

module.exports = Server;
