const express = require("express");
const Docker = require("dockerode");
const app = express();
const port = 3002;

// Initialize Docker client
const docker = new Docker({ socketPath: "/var/run/docker.sock" });

// Middleware for parsing JSON requests
app.use(express.json());

// Route to list running containers
app.get("/instances", async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    res.json(containers);
  } catch (err) {
    console.error("Error fetching containers:", err);
    res.status(500).json({ error: "Failed to fetch containers" });
  }
});

// Route to get status of a specific container by ID
app.get("/state/:id", async (req, res) => {
  try {
    const containerId = req.params.id;
    const container = docker.getContainer(containerId);
    const containerInfo = await container.inspect();
    res.json(containerInfo.State);
  } catch (err) {
    console.error("Error fetching container status:", err);
    res.status(500).json({ error: "Failed to fetch container status" });
  }
});

// Route to create a new container
app.post("/instance/create", async (req, res) => {
  try {
    const { Image, name, Cmd, Env, HostConfig } = req.body;

    const container = await docker.createContainer({
      Image,
      name,
      Cmd,
      Env,
      HostConfig,
    });

    res
      .status(201)
      .json({ message: "Container created successfully", container });
  } catch (err) {
    console.error("Error creating container:", err);
    res.status(500).json({ error: "Failed to create container" });
  }
});

// Route to start a container
app.post("/instance/start/:id", async (req, res) => {
  try {
    const containerId = req.params.id;
    const container = docker.getContainer(containerId);
    await container.start();
    res.status(200).json({ message: "Container started successfully" });
  } catch (err) {
    console.error("Error starting container:", err);
    res.status(500).json({ error: "Failed to start container" });
  }
});

// Route to stop a container
app.post("/instance/stop/:id", async (req, res) => {
  try {
    const containerId = req.params.id;
    const container = docker.getContainer(containerId);
    await container.stop();
    res.status(200).json({ message: "Container stopped successfully" });
  } catch (err) {
    console.error("Error stopping container:", err);
    res.status(500).json({ error: "Failed to stop container" });
  }
});

// Route to remove a container
app.delete("/instance/:id", async (req, res) => {
  try {
    const containerId = req.params.id;
    const container = docker.getContainer(containerId);
    await container.remove();
    res.status(200).json({ message: "Container removed successfully" });
  } catch (err) {
    console.error("Error removing container:", err);
    res.status(500).json({ error: "Failed to remove container" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
