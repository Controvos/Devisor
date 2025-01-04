const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://mainuser:Allexander01@cluster0.3owwf.mongodb.net/testmongodbformygamepanel?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {   
    console.error('Database connection error:', err);
    process.exit(1); 
  }
};

module.exports = connectDB;
