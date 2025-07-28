const express = require('express');
const router = express.Router();
const User = require('../models/user');
const emailService = require('../services/emailService');

// Input validation helper function
const validateUserInput = (name, email) => {
  const errors = [];
  
  // Name validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  } else if (name.trim().length > 255) {
    errors.push('Name must be less than 255 characters');
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email is required and must be a non-empty string');
  } else if (!emailRegex.test(email.trim())) {
    errors.push('Email must be a valid email address');
  } else if (email.trim().length > 255) {
    errors.push('Email must be less than 255 characters');
  }
  
  return errors;
};

// Format error response helper function
const formatErrorResponse = (message, errors = []) => {
  return {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  };
};

// Format success response helper function
const formatSuccessResponse = (message, data = {}) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

// POST /api/register - Register new user and send confirmation email
router.post('/register', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Input validation
    const validationErrors = validateUserInput(name, email);
    if (validationErrors.length > 0) {
      return res.status(400).json(
        formatErrorResponse('Validation failed', validationErrors)
      );
    }
    
    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim().toLowerCase();
    
    // Check for duplicate email
    const existingUserResult = await User.getUserByEmail(sanitizedEmail);
    if (existingUserResult.success) {
      return res.status(409).json(
        formatErrorResponse('Email address is already registered')
      );
    }
    
    // If error is not USER_NOT_FOUND, it's a real error
    if (!existingUserResult.success && existingUserResult.error !== 'USER_NOT_FOUND') {
      console.error('Error checking for duplicate email:', existingUserResult);
      return res.status(500).json(
        formatErrorResponse('Internal server error while checking email')
      );
    }
    
    // Create user in database
    const newUserResult = await User.createUser(sanitizedName, sanitizedEmail);
    if (!newUserResult.success) {
      console.error('Error creating user:', newUserResult);
      if (newUserResult.error === 'DUPLICATE_EMAIL') {
        return res.status(409).json(
          formatErrorResponse('Email address is already registered')
        );
      }
      return res.status(500).json(
        formatErrorResponse('Internal server error while creating user')
      );
    }
    
    // Send confirmation email
    const emailResult = await emailService.sendConfirmationEmail(sanitizedName, sanitizedEmail);
    
    // Update email sent status if email was sent successfully
    if (emailResult.success) {
      const updateResult = await User.updateEmailSentStatus(newUserResult.userId);
      if (!updateResult.success) {
        console.warn('Failed to update email sent status:', updateResult);
      }
    }
    
    // Return success response with email status
    return res.status(201).json(
      formatSuccessResponse(
        emailResult.success 
          ? 'User registered successfully and confirmation email sent!'
          : 'User registered successfully, but email sending failed. Please check the email configuration.',
        {
          userId: newUserResult.userId,
          name: sanitizedName,
          email: sanitizedEmail,
          emailSent: emailResult.success,
          emailError: emailResult.success ? null : emailResult.message
        }
      )
    );
    
  } catch (error) {
    console.error('Unexpected error in /api/register:', error);
    return res.status(500).json(
      formatErrorResponse('Internal server error')
    );
  }
});

module.exports = router;