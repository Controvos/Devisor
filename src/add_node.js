const mongoose = require("mongoose");
const Node = require("./db/models/Nodes");

// MongoDB connection URI
const mongoURI = "";

// Function to add a new node
async function addNode(nodeData) {
  try {
    // Connect to the database
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to the database.");

    // Create a new node
    const newNode = new Node({
      name: nodeData.name,
      ipAddress: nodeData.ipAddress,
      status: nodeData.status || "inactive",
    });

    // Save the node to the database
    const savedNode = await newNode.save();
    console.log("Node added successfully:", savedNode);
  } catch (error) {
    console.error("Error adding node:", error.message);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
    console.log("Disconnected from the database.");
  }
}

const nodeData = {
  name: "Node-1",
  ipAddress: "188.130.207.56",
  status: "active",
};

addNode(nodeData);
