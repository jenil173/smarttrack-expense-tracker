const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[SUCCESS] MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries++;
      console.error(`[ERROR] MongoDB connection failed (Attempt ${retries}/${maxRetries}): ${error.message}`);
      
      if (retries < maxRetries) {
        console.log(`Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error('Critical Error: Could not connect to MongoDB after multiple attempts.');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
