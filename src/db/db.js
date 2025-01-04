const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {   
    console.error('Database connection error:', err);
    process.exit(1); // Exit process if database connection fails
  }
};

module.exports = connectDB;
