const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const contactRoutes = require('./routes/contact');
const { contactRateLimit, apiRateLimit } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Rate limiting
app.use('/api', apiRateLimit);

// Routes
console.log('Registering contact routes...');
app.use('/api/contact', contactRateLimit, contactRoutes);
console.log('Contact routes registered successfully');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test contact endpoint directly
app.get('/api/contact/test-direct', (req, res) => {
  res.json({
    success: true,
    message: 'Direct contact test endpoint working!',
    timestamp: new Date().toISOString()
  });
});

// Test contact submit endpoint directly
app.post('/api/contact/submit-direct', (req, res) => {
  console.log('Direct submit endpoint hit:', req.body);
  res.json({
    success: true,
    message: 'Direct submit endpoint working!',
    data: req.body
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not set - running without database');
      return false;
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.warn('⚠️  Continuing without database - data will not be saved');
    return false;
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📧 Contact API: http://localhost:${PORT}/api/contact`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🧪 Test endpoints:`);
      console.log(`   GET  http://localhost:${PORT}/api/contact/test-direct`);
      console.log(`   POST http://localhost:${PORT}/api/contact/submit-direct`);
      console.log(`   GET  http://localhost:${PORT}/api/contact/test`);
      console.log(`   POST http://localhost:${PORT}/api/contact/submit`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

startServer();
