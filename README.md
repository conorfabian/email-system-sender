# Email Confirmation System

A professional web application built for ScriptChain that collects user information and sends confirmation emails. This system features a modern AngularJS frontend, robust Node.js backend, and MySQL database integration with comprehensive email functionality.

## Technologies Used

### Frontend
- **AngularJS 1.8.2** - JavaScript framework for building the single-page application
- **Bootstrap 5.1.3** - CSS framework for responsive design and professional styling
- **Vanilla CSS3** - Custom styling with gradients and animations

### Backend
- **Node.js 24.3.0+** - JavaScript runtime environment
- **Express.js 5.1.0** - Web application framework
- **MySQL2 3.14.2** - MySQL database driver with connection pooling
- **Nodemailer 7.0.5** - Email sending service
- **CORS 2.8.5** - Cross-origin resource sharing middleware
- **Body-parser 2.2.0** - Request body parsing middleware
- **Dotenv 17.2.1** - Environment variable management

### Database
- **MySQL 9.3.0+** - Relational database management system

### Development Tools
- **Nodemon 3.1.10** - Development server with auto-restart
- **Git 2.39.5+** - Version control system

## Prerequisites

Before installing and running this application, ensure you have the following installed:

### Required Software
- **Node.js v18.0.0 or higher** (v24.3.0 recommended)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`

- **MySQL v8.0.0 or higher** (v9.3.0 recommended)
  - Download from: https://dev.mysql.com/downloads/mysql/
  - Or install via Homebrew (macOS): `brew install mysql`
  - Verify installation: `mysql --version`

- **Git v2.30.0 or higher**
  - Download from: https://git-scm.com/downloads
  - Verify installation: `git --version`

### Email Service Account
- **Gmail account** with App Password enabled (recommended)
  - Or alternative SMTP service (SendGrid, Mailgun, etc.)

### Browser Compatibility
- Modern web browser with JavaScript enabled
- Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

## Installation Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd email-confirmation-system
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the backend directory:
```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration (see Environment Variables section below).

### 4. Database Setup
See the Database Setup section below for detailed instructions.

### 5. Start the Application
```bash
# Start backend server (from backend directory)
npm run dev
```

The application will be available at:
- **Frontend**: Open `frontend/index.html` in your browser
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## Database Setup

### 1. Start MySQL Service
```bash
# macOS (Homebrew)
brew services start mysql

# Linux (systemd)
sudo systemctl start mysql

# Windows
net start mysql
```

### 2. Access MySQL Console
```bash
mysql -u root -p
# Enter your MySQL root password when prompted
# (No password required if installed via Homebrew)
```

### 3. Create Database and Tables
```bash
# From the project root directory
mysql -u root -p < database/schema.sql
```

### 4. Verify Database Creation
```sql
mysql -u root -p
USE email_confirmation;
SHOW TABLES;
DESCRIBE users;
```

Expected output:
```
+----------------+--------------+------+-----+-------------------+-------------------+
| Field          | Type         | Null | Key | Default           | Extra             |
+----------------+--------------+------+-----+-------------------+-------------------+
| id             | int          | NO   | PRI | NULL              | auto_increment    |
| name           | varchar(255) | NO   |     | NULL              |                   |
| email          | varchar(255) | NO   | UNI | NULL              |                   |
| created_at     | timestamp    | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| email_sent     | tinyint(1)   | YES  |     | 0                 |                   |
| email_sent_at  | timestamp    | YES  |     | NULL              |                   |
+----------------+--------------+------+-----+-------------------+-------------------+
```

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=email_confirmation

# Email Service Configuration (Gmail Example)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Alternative SMTP Configuration
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
```

### Gmail App Password Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings → Security → App passwords
3. Generate a new app password for "Mail"
4. Use this app password (not your regular password) in `EMAIL_PASS`

### Alternative Email Services
- **SendGrid**: Use API key in `EMAIL_PASS`
- **Mailgun**: Configure SMTP settings
- **Amazon SES**: Use SMTP credentials

## How to Run the Application

### Development Mode

1. **Start the Backend Server**
```bash
cd backend
npm run dev
```
The server will start on http://localhost:3000 with auto-restart on file changes.

2. **Open the Frontend**
```bash
# Open frontend/index.html in your browser
# Or serve it with a simple HTTP server:
cd frontend
python3 -m http.server 8080
# Then visit http://localhost:8080
```

### Production Mode

1. **Start the Backend Server**
```bash
cd backend
npm start
```

2. **Serve Frontend**
Use a proper web server (nginx, Apache, or CDN) to serve the frontend files.

### Verification Steps

1. **Check Backend Health**
```bash
curl http://localhost:3000/api/health
```
Expected response:
```json
{
  "success": true,
  "message": "Email Confirmation System API is running",
  "timestamp": "2025-07-28T...",
  "version": "1.0.0"
}
```

2. **Test Database Connection**
Check the server console logs for "Database connected successfully" message.

3. **Access Frontend**
Open `frontend/index.html` and verify the form loads correctly.

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### GET /api/health
**Description**: Health check endpoint to verify server status.

**Response**:
```json
{
  "success": true,
  "message": "Email Confirmation System API is running",
  "timestamp": "2025-07-28T14:30:00.000Z",
  "version": "1.0.0"
}
```

#### POST /api/register
**Description**: Register a new user and send confirmation email.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully and confirmation email sent",
  "timestamp": "2025-07-28T14:30:00.000Z",
  "userId": 1
}
```

**Error Responses**:

**400 Bad Request** (Validation Error):
```json
{
  "success": false,
  "message": "Name is required",
  "timestamp": "2025-07-28T14:30:00.000Z"
}
```

**409 Conflict** (Duplicate Email):
```json
{
  "success": false,
  "message": "Email address is already registered",
  "timestamp": "2025-07-28T14:30:00.000Z"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Database error occurred",
  "timestamp": "2025-07-28T14:30:00.000Z"
}
```

### Request Validation
- **Name**: Required, 1-255 characters, trimmed
- **Email**: Required, valid email format, converted to lowercase
- **Duplicate Check**: Email addresses must be unique

## Testing Approach

### Manual Testing with Temporary Email Services

This application has been thoroughly tested using temporary email services to verify email delivery and content.

**Recommended Temporary Email Services**:
- https://temp-mail.org/
- https://10minutemail.com/
- https://guerrillamail.com/
- https://tempmail.email/

### Test Cases Covered

#### 1. Valid User Registration
- **Input**: Valid name and email
- **Expected**: 201 status, success message, email delivered
- **Verification**: Check temporary inbox for confirmation email

#### 2. Duplicate Email Handling
- **Input**: Same email address twice
- **Expected**: First succeeds (201), second fails (409)
- **Verification**: Only one database entry, one email sent

#### 3. Input Validation
- **Empty Name**: 400 error with appropriate message
- **Empty Email**: 400 error with appropriate message
- **Invalid Email Format**: 400 error with appropriate message
- **Very Long Names**: Accepted if under 255 characters

#### 4. Edge Cases
- **Special Characters**: Names with apostrophes, hyphens, spaces
- **International Emails**: Unicode domain names and addresses
- **Case Sensitivity**: Email addresses normalized to lowercase

#### 5. Email Content Verification
- **User Name Display**: Confirmation email includes user's name
- **Email Address Display**: Email body shows recipient address
- **Professional Format**: HTML and plain text versions

### Database Testing
```sql
-- Verify user creation
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;

-- Check email sent status
SELECT name, email, email_sent, email_sent_at FROM users WHERE email_sent = 1;

-- Verify no duplicates
SELECT email, COUNT(*) as count FROM users GROUP BY email HAVING count > 1;
```

### API Testing with cURL
```bash
# Valid registration
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@temp-mail.org"}'

# Duplicate email test
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Another User","email":"test@temp-mail.org"}'

# Invalid email test
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"invalid-email"}'
```

## Temporary Email Services Used

The following temporary email services were used during development and testing:

### Primary Testing Services
1. **temp-mail.org**
   - Reliable email delivery
   - Instant inbox updates
   - Clean interface for verification

2. **10minutemail.com**
   - 10-minute email lifespan
   - Good for quick testing
   - Automatic refresh capability

3. **guerrillamail.com**
   - Longer email retention
   - Custom email address options
   - Multiple domain choices

### Alternative Services
- **tempmail.email** - Simple interface, reliable delivery
- **maildrop.cc** - Public inbox, good for demos
- **mohmal.com** - Arabic and English support

### Email Verification Checklist
When testing with temporary emails:
- [ ] Email delivered within 30 seconds
- [ ] Subject line includes user's name
- [ ] Email body contains user's name
- [ ] Email body displays recipient email address
- [ ] Professional HTML formatting
- [ ] Plain text fallback available
- [ ] ScriptChain branding present

## Known Issues

### Current Limitations
1. **Email Service Dependencies**
   - Requires valid SMTP credentials for email functionality
   - Gmail may require app-specific passwords
   - Rate limiting not implemented for production use

2. **Frontend Serving**
   - Frontend files must be served via HTTP server for CORS
   - File:// protocol may cause CORS issues in some browsers

3. **Database Connection**
   - MySQL service must be running before starting backend
   - No automatic database creation (manual setup required)

### Browser Compatibility
- **Internet Explorer**: Not supported (AngularJS 1.8.2 compatibility)
- **Safari < 14**: Limited support for modern CSS features

### Security Considerations
- **Input Sanitization**: Basic validation implemented
- **SQL Injection**: Protected via parameterized queries
- **Rate Limiting**: Not implemented (recommended for production)
- **HTTPS**: Not configured (recommended for production)

## Future Improvements

### Planned Features
1. **Enhanced Security**
   - Rate limiting for API endpoints
   - HTTPS/SSL certificate configuration
   - Advanced input sanitization and validation
   - CSRF protection implementation

2. **User Experience**
   - Email verification/confirmation links
   - Resend email functionality
   - User dashboard for managing subscriptions
   - Real-time form validation feedback

3. **Admin Features**
   - Admin dashboard for user management
   - Email template customization interface
   - Analytics and reporting dashboard
   - Bulk email operations

4. **Technical Improvements**
   - Email queue system with retry logic
   - Database connection pooling optimization
   - Automated testing suite (unit and integration)
   - Docker containerization for easy deployment

5. **Email Enhancements**
   - Multiple email template options
   - Email scheduling functionality
   - Rich text email editor
   - Email tracking and analytics

6. **Performance Optimizations**
   - CDN integration for frontend assets
   - Database query optimization
   - Response caching implementation
   - Frontend build process and minification

### Deployment Considerations
- **Production Database**: Migrate to cloud MySQL (AWS RDS, Google Cloud SQL)
- **Email Service**: Upgrade to professional service (SendGrid, Mailgun)
- **Hosting**: Deploy to cloud platform (AWS, Google Cloud, Heroku)
- **Domain**: Configure custom domain with SSL certificate
- **Monitoring**: Add application monitoring and logging
- **Backup**: Implement automated database backups

### Scalability Improvements
- **Load Balancing**: Multiple backend instances
- **Database Sharding**: Handle large user bases
- **Message Queue**: Asynchronous email processing
- **Microservices**: Separate email service
- **CDN**: Global content delivery for frontend

---

## Project Structure

```
email-confirmation-system/
├── backend/                 # Node.js backend application
│   ├── config/
│   │   └── database.js      # MySQL connection configuration
│   ├── models/
│   │   └── user.js          # User data model and database operations
│   ├── routes/
│   │   └── api.js           # API route definitions
│   ├── services/
│   │   └── emailService.js  # Email sending functionality
│   ├── server.js            # Express server setup and configuration
│   ├── package.json         # Backend dependencies and scripts
│   └── .env                 # Environment variables (not in repo)
├── frontend/                # AngularJS frontend application
│   ├── controllers/
│   │   └── emailController.js # Form controller logic
│   ├── services/
│   │   └── apiService.js    # API communication service
│   ├── index.html           # Main HTML page
│   ├── app.js               # AngularJS application setup
│   └── styles.css           # Custom CSS styling
├── database/
│   └── schema.sql           # MySQL database schema
├── README.md                # This documentation file
├── CLAUDE.md                # Development session history
├── PLANNING.md              # Project planning and timeline
├── PRD.md                   # Product requirements document
└── TASKS.md                 # Task tracking and completion status
```

---

## Support and Contact

For questions, issues, or contributions related to this project:

- **Developer**: Conor Fabian
- **Company**: ScriptChain
- **Project Type**: Software Development Engineer Interview Assignment
- **Development Period**: July 28-30, 2025

### Development Environment
- **IDE**: Cursor
- **Version Control**: Git
- **Database**: MySQL 9.3.0
- **Runtime**: Node.js 24.3.0
- **Operating System**: macOS (Darwin 24.5.0)

---

*This project was developed as part of a technical interview process for ScriptChain. It demonstrates full-stack web development capabilities using modern technologies and best practices.*