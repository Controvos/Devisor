const express = require('express');
const connectDB = require('./db/db');
const User = require('./db/models/User');
const bcrypt = require('bcryptjs'); 
const path = require('path');
const session = require('express-session');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
connectDB();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to handle sessions
app.use(session({
    secret: 'your-secret-key', // Replace with a unique secret key
    resave: false,
    saveUninitialized: true,
}));

// Routes for user registration and login
app.get('/register', (req, res) => {
  res.render('auth/register'); 
});

app.get('/login', (req, res) => {
  res.render('auth/login'); 
});

// User registration route
app.post('/register', async (req, res) => {
    try {
      const { username, email, password, confirmPassword } = req.body;
  
      // Check if passwords match
      if (password !== confirmPassword) {
        return res.status(400).render('auth/register', { message: 'Passwords do not match' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10); 
  
      // Create new user
      const user = new User({ username, email, password: hashedPassword }); 
      await user.save(); 
  
      res.status(201).redirect('/login');
    } catch (err) {
      res.status(500).render('auth/register', { message: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).render('auth/login', { message: 'Invalid email or password' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).render('auth/login', { message: 'Invalid email or password' });
      }
  
      req.session.user = user; // Set session user
      res.status(200).redirect('/dashboard'); // Redirect to dashboard
    } catch (err) {
      res.status(500).render('auth/login', { message: err.message });
    }
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login'); 
    }
    res.render('dashboard', { req }); 
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.redirect('/dashboard'); 
      }
      res.clearCookie('connect.sid'); 
      res.redirect('/login');
    });
});

// Routes for managing containers via daemon
app.post('/instances/create', async (req, res) => {
    try {
        const { Image, Id, Cmd, Env, Ports, Scripts, Memory, Cpu, PortBindings, variables } = req.body;
        const response = await axios.post('http://your-external-server-url/instances/create', {
            Image, Id, Cmd, Env, Ports, Scripts, Memory, Cpu, PortBindings, variables
        });
        res.status(202).json(response.data); // Send response from external server
    } catch (error) {
        res.status(500).json({ message: 'Failed to create container', error: error.message });
    }
});


app.get('/state/:volumeId', async (req, res) => {
    try {
        const { volumeId } = req.params;
        const response = await axios.get(`http://your-external-server-url/state/${volumeId}`);
        res.status(200).json(response.data); 
    } catch (error) {
        res.status(500).json({ message: 'Failed to get container state', error: error.message });
    }
});


app.put('/instances/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Image, Memory, Cpu, VolumeId } = req.body;
        const response = await axios.put(`http://your-external-server-url/instances/edit/${id}`, {
            Image, Memory, Cpu, VolumeId
        });
        res.status(200).json(response.data); // Send response from external server
    } catch (error) {
        res.status(500).json({ message: 'Failed to edit container', error: error.message });
    }
});


app.delete('/instances/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.delete(`http://your-external-server-url/instances/${id}`);
        res.status(200).json(response.data); // Send response from external server
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete container', error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
