const dotenv = require('dotenv');
dotenv.config();  // Load environment variables FIRST

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const sequelize = require('./config/database');

const app = express();

// Middleware
const corsOptions = {
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allow these headers
};

app.use(cors(corsOptions)); // Use the CORS middleware with options
app.use(express.json()); // Parse JSON bodies
app.use('/uploads', express.static('uploads')); // Serve static files (images, etc.)

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);

// Database connection and server start
sequelize.sync().then(() => {
  console.log('Database connected successfully!');
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
}).catch((err) => {
  console.error('Error connecting to the database', err);
  console.error('Department rating analysis error:', err, err.stack);
  res.status(500).json({ error: 'Server error: ' + err.message });
});