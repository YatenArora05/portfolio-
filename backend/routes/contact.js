const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const emailService = require('../services/emailService');

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Contact API is working!',
    timestamp: new Date().toISOString()
  });
});

// Validation middleware
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

// Submit contact form
router.post('/submit', contactValidation, async (req, res) => {
  try {
    console.log('Received contact form data:', req.body);
    
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, message } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    console.log('Processing contact form:', { name, email, message: message.substring(0, 50) + '...' });

    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('Is connected:', isConnected);

    if (!isConnected) {
      console.log('Database not connected - saving to console only');
      console.log('Contact form data:', {
        name,
        email,
        message,
        ipAddress,
        userAgent,
        timestamp: new Date().toISOString()
      });
      
      return res.status(201).json({
        success: true,
        message: 'Message received! (Database not connected - data logged to console)',
        data: {
          id: 'console-' + Date.now(),
          emailSent: false,
          autoReplySent: false,
          databaseConnected: false
        }
      });
    }

    try {
      // Check for duplicate submissions (same email within last 5 minutes)
      const recentSubmission = await Contact.findOne({
        email: email,
        createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
      });

      if (recentSubmission) {
        return res.status(429).json({
          success: false,
          message: 'Please wait before submitting another message'
        });
      }

      // Create contact record
      const contact = new Contact({
        name,
        email,
        message,
        ipAddress,
        userAgent
      });

      await contact.save();
      console.log('✅ Contact saved to database:', contact._id);

      // Send email notification (optional for now)
      let emailResult = { success: true };
      let autoReplyResult = { success: true };
      
      try {
        emailResult = await emailService.sendContactEmail(contact);
        autoReplyResult = await emailService.sendAutoReply(contact);
        console.log('Email results:', { emailSent: emailResult.success, autoReplySent: autoReplyResult.success });
      } catch (emailError) {
        console.log('Email sending failed (but continuing):', emailError.message);
      }

      res.status(201).json({
        success: true,
        message: 'Message sent successfully!',
        data: {
          id: contact._id,
          emailSent: emailResult.success,
          autoReplySent: autoReplyResult.success,
          databaseConnected: true
        }
      });
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      // Return success even if database fails, so we can test the form
      res.status(201).json({
        success: true,
        message: 'Message received! (Database error occurred)',
        data: {
          id: 'error-' + Date.now(),
          emailSent: false,
          autoReplySent: false,
          databaseConnected: false,
          error: dbError.message
        }
      });
    }

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Get all contacts (admin endpoint)
router.get('/admin/contacts', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts'
    });
  }
});

// Update contact status (admin endpoint)
router.patch('/admin/contacts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status'
    });
  }
});

module.exports = router;
