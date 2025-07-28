const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  // Initialize the email transporter
  async initialize() {
    try {
      if (this.initialized) {
        return { success: true, message: 'Email service already initialized' };
      }

      // Get email configuration from environment variables
      const emailService = process.env.EMAIL_SERVICE || 'gmail';
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

      // Validate configuration
      if (!emailUser || !emailPass) {
        console.error('Email configuration missing: EMAIL_USER and EMAIL_PASS required');
        return {
          success: false,
          error: 'CONFIGURATION_ERROR',
          message: 'Email service configuration is incomplete'
        };
      }

      // Create transporter configuration
      let transportConfig;
      
      if (emailService === 'gmail') {
        transportConfig = {
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass
          }
        };
      } else {
        // Generic SMTP configuration
        transportConfig = {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: (process.env.SMTP_SECURE === 'true') || false,
          auth: {
            user: emailUser,
            pass: emailPass
          }
        };
      }

      // Create transporter
      this.transporter = nodemailer.createTransport(transportConfig);

      // Verify connection
      await this.transporter.verify();
      
      this.initialized = true;
      console.log('✅ Email service initialized successfully');
      
      return {
        success: true,
        message: 'Email service initialized successfully'
      };
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      
      return {
        success: false,
        error: 'INITIALIZATION_ERROR',
        message: 'Failed to initialize email service',
        details: error.message
      };
    }
  }

  // Generate email template
  generateEmailTemplate(name, email) {
    const subject = `Welcome to ScriptChain Email System, ${name}!`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ScriptChain</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .content {
              padding: 20px;
              background-color: #ffffff;
              border: 1px solid #e9ecef;
              border-radius: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding: 20px;
              font-size: 14px;
              color: #6c757d;
            }
            .highlight {
              background-color: #e3f2fd;
              padding: 10px;
              border-radius: 4px;
              margin: 10px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Welcome to ScriptChain!</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${name},</h2>
            
            <p>Thank you for registering with our email confirmation system!</p>
            
            <p>We're excited to have you on board. This confirmation email serves as verification that your registration was successful.</p>
            
            <div class="highlight">
              This confirmation email has been sent to: <strong>${email}</strong>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
            
            <p>Best regards,<br>
            <strong>The ScriptChain Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from ScriptChain Email Confirmation System.</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Welcome to ScriptChain Email System, ${name}!

Hello ${name},

Thank you for registering with our email confirmation system!

We're excited to have you on board. This confirmation email serves as verification that your registration was successful.

This confirmation email has been sent to: ${email}

If you have any questions or need assistance, please don't hesitate to reach out to our support team.

Best regards,
The ScriptChain Team

---
This is an automated message from ScriptChain Email Confirmation System.
Generated on ${new Date().toLocaleString()}
    `;

    return {
      subject,
      html: htmlContent,
      text: textContent
    };
  }

  // Send confirmation email
  async sendConfirmationEmail(name, email) {
    try {
      // Ensure service is initialized
      if (!this.initialized) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return initResult;
        }
      }

      // Validate inputs
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Name is required and must be a non-empty string'
        };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
        return {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Valid email address is required'
        };
      }

      // Generate email content
      const emailTemplate = this.generateEmailTemplate(name.trim(), email.trim());

      // Email options
      const mailOptions = {
        from: {
          name: 'ScriptChain Email System',
          address: process.env.EMAIL_USER
        },
        to: email.trim(),
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html
      };

      // Send email
      console.log(`📧 Sending confirmation email to: ${email}`);
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully:', info.messageId);
      
      return {
        success: true,
        message: 'Confirmation email sent successfully',
        messageId: info.messageId,
        recipient: email
      };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      
      return {
        success: false,
        error: 'SEND_ERROR',
        message: 'Failed to send confirmation email',
        details: error.message
      };
    }
  }

  // Test email connection
  async testConnection() {
    try {
      if (!this.initialized) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return initResult;
        }
      }

      await this.transporter.verify();
      
      return {
        success: true,
        message: 'Email service connection test successful'
      };
    } catch (error) {
      console.error('❌ Email service connection test failed:', error);
      
      return {
        success: false,
        error: 'CONNECTION_ERROR',
        message: 'Email service connection test failed',
        details: error.message
      };
    }
  }
}

// Create and export singleton instance
const emailService = new EmailService();

module.exports = emailService;