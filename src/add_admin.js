const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const User = require('./db/models/User');

// Database connection
async function connectDB() {
    try {
        await mongoose.connect('//', { // Add to env soon.
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected...');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

// Function to add admin user
async function addAdminUser(username, email, password) {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); 

        // Create and save the admin user
        const adminUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        await adminUser.save();

        console.log('Admin user added successfully!');
    } catch (err) {
        console.error('Error adding admin user:', err);
    }
}

// Example usage
connectDB(); // Connect to the database
addAdminUser('allexander', 'adminlinux@gmail.com', 'Allexander01'); // Add the admin user
