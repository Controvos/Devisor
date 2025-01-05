const express = require("express");
const connectDB = require("./db/db");
const bcrypt = require("bcryptjs");
const path = require("path");
const session = require("express-session");
const axios = require("axios");

////////////////////////////////
const User = require("./db/models/User");
const Instance = require("./db/models/Server");
const Node = require("./db/models/Nodes");

const app = express();
const PORT = 3000;

///////////////////////////////

///////////////////////////////
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Middleware to handle sessions
app.use(
  session({
    secret: "your-secret-key", // Replace with a unique secret key
    resave: false,
    saveUninitialized: true,
  }),
);

// Routes for user registration and login
app.get("/register", (req, res) => {
  res.render("auth/register");
});

app.get("/login", (req, res) => {
  res.render("auth/login");
});

// User registration route
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res
        .status(400)
        .render("auth/register", { message: "Passwords do not match" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).redirect("/login");
  } catch (err) {
    res.status(500).render("auth/register", { message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .render("auth/login", { message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .render("auth/login", { message: "Invalid email or password" });
    }

    req.session.user = user; // Set session user
    res.status(200).redirect("/dashboard"); // Redirect to dashboard
  } catch (err) {
    res.status(500).render("auth/login", { message: err.message });
  }
});

//////////////////////////////////////////////////////////////
// Dashboard route
app.get("/dashboard", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    // Fetch instances related to the logged-in user
    const instances = await Instance.find({ userId: req.session.user._id });
    res.render("dashboard", { user: req.session.user, instances, req });
  } catch (error) {
    console.error("Error fetching instances:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/instances/create", async (req, res) => {
  try {
    const nodes = await Node.find(); // Fetch all nodes from the database
    res.render("create-instance", { user: req.session.user, nodes });
  } catch (error) {
    console.error("Error fetching nodes:", error);
    res.status(500).send("Server error while fetching nodes.");
  }
});

// Update settings, Should merge it?
app.post("/update-settings", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const { username, email, password } = req.body;

    // Validate and update user information
    const userUpdates = {};
    if (username) userUpdates.username = username;
    if (email) userUpdates.email = email;
    if (password) userUpdates.password = await bcrypt.hash(password, 10); // Hash password if updated

    await User.findByIdAndUpdate(req.session.user._id, userUpdates);

    req.session.user = await User.findById(req.session.user._id); // Update session user

    res.redirect("/settings"); // Redirect back to settings with success message
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).render("settings", {
      message: "An error occurred while updating your settings.",
    });
  }
});

// Settings Route
app.get("/settings", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("user/settings", {
    user: req.session.user,
    currentPage: "settings",
  });
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/dashboard");
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

//////////////////////////////////////////////////////////////
// Routes for managing containers via daemon
app.post("/instances/create", async (req, res) => {
  const { serverName, nodeId, dockerImage } = req.body;

  try {
    const node = await Node.findById(nodeId); // Find node by ID

    if (!node) {
      return res.status(400).send("Invalid node selected.");
    }

    const newInstance = new Instance({
      serverName,
      nodeName: node.ip, // Use the node IP from the database
      userId: req.session.user._id,
      image: dockerImage, // Send the docker image / server type
    });

    await newInstance.save();

    // Construct the URL dynamically based on the node's IP
    const externalServerUrl = `http://${node.ip}/instances/create`;

    // Send the data to the external server for container creation
    await axios.post(externalServerUrl, {
      serverName,
      nodeIp: node.ip,
      dockerImage,
    });

    res.redirect("/dashboard"); // Redirect to dashboard after instance creation
  } catch (error) {
    console.error("Error creating instance:", error);
    res
      .status(500)
      .render("create-instance", { message: "Error creating instance" });
  }
});

app.get("/state/:volumeId", async (req, res) => {
  try {
    const { volumeId } = req.params;
    const response = await axios.get(
      `http://your-external-server-url/state/${volumeId}`,
    );
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get container state", error: error.message });
  }
});

app.put("/instances/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { Image, Memory, Cpu, VolumeId } = req.body;
    const response = await axios.put(
      `http://your-external-server-url/instances/edit/${id}`,
      {
        Image,
        Memory,
        Cpu,
        VolumeId,
      },
    );
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to edit container", error: error.message });
  }
});

app.delete("/instances/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.delete(
      `http://your-external-server-url/instances/${id}`,
    );
    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete container", error: error.message });
  }
});

//////////////////////////////////////////////////////////////
// Node Management - Admin Area
app.get("/admin/nodes", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/login");
  }
  const nodes = await Node.find();
  res.render("admin/nodes/index", { nodes });
});

app.get("/admin/nodes/add", (req, res) => {
  // Admin check
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/login");
  }
  res.render("admin/nodes/add");
});

app.post("/admin/nodes/add", async (req, res) => {
  try {
    const { name, ipAddress, status } = req.body;
    const node = new Node({ name, ipAddress, status });
    await node.save(); // Save the new node
    res.redirect("/admin/nodes");
  } catch (error) {
    console.error("Error adding node:", error);
    res.status(500).render("admin/nodes/add", { message: "Error adding node" });
  }
});

app.get("/admin/nodes/edit/:id", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/login");
  }
  const node = await Node.findById(req.params.id);
  if (!node) {
    return res.status(404).render("admin/nodes", { message: "Node not found" });
  }
  res.render("admin/nodes/edit", { node });
});

app.post("/admin/nodes/edit/:id", async (req, res) => {
  try {
    const { name, ipAddress, status } = req.body;
    const updatedNode = await Node.findByIdAndUpdate(
      req.params.id,
      { name, ipAddress, status },
      { new: true },
    );
    if (!updatedNode) {
      return res
        .status(404)
        .render("admin/nodes/edit", { message: "Node not found" });
    }
    res.redirect("/admin/nodes");
  } catch (error) {
    console.error("Error updating node:", error);
    res
      .status(500)
      .render("admin/nodes/edit", { message: "Error updating node" });
  }
});

app.get("/admin/nodes/delete/:id", async (req, res) => {
  try {
    const deletedNode = await Node.findByIdAndDelete(req.params.id);
    if (!deletedNode) {
      return res.status(404).redirect("/admin/nodes");
    }
    res.redirect("/admin/nodes");
  } catch (error) {
    console.error("Error deleting node:", error);
    res.status(500).redirect("/admin/nodes");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
