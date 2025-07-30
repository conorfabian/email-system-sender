# Backend Code Breakdown

My notes on how the backend works - wrote this for myself so I don't forget how everything fits together.

## server.js - The Main Express Server

This is where everything starts. I set up the Express server with all the middleware and routing.

**What it does:**
- Loads environment variables with `dotenv` (for database credentials, email settings)
- Sets up CORS to allow my frontend to talk to the backend
- Configures body parsing for JSON requests
- Connects all the API routes
- Starts the server and tests the database connection

**Key decisions I made:**
- Put CORS origins as `['http://localhost:8080', 'file://', 'null']` because I'm serving the frontend as a file, not through a web server
- Added a health check endpoint at `/api/health` so I can quickly test if the server is running
- Made the server test the database connection on startup - if MySQL isn't running, the server won't start (fail fast)
- Used async/await for the startup process to handle database connection errors gracefully

**The startup flow:**
1. Server loads config from .env
2. Tests database connection 
3. If database works, starts listening on port 3000
4. If database fails, server exits with error code 1

## config/database.js - MySQL Connection Management

I use connection pooling here instead of single connections because it's more efficient.

**What it does:**
- Creates a MySQL connection pool with 10 max connections
- Provides functions to get/release connections
- Handles connection errors gracefully

**Why I did it this way:**
- Connection pooling prevents "too many connections" errors
- The `getConnection()` function automatically creates the pool if it doesn't exist
- Each query gets its own connection from the pool, then releases it back
- Added a `testConnection()` function that I use on server startup

**Connection lifecycle:**
1. `createPool()` - makes the connection pool
2. `getConnection()` - borrows a connection from the pool  
3. Use the connection for queries
4. `connection.release()` - returns connection to pool
5. `closePool()` - shuts down all connections (for cleanup)

## models/user.js - Database Operations

This is my "User" class that handles all database operations. I used static methods because I don't need to create user instances.

**The four main methods:**

### createUser(name, email)
- Inserts a new user into the database
- Sets `email_sent` to FALSE initially (will update later when email sends)
- Catches duplicate email errors and returns a nice error message
- Returns the user ID if successful

### getUserByEmail(email) 
- Looks up a user by their email address
- Returns user data if found, or USER_NOT_FOUND error if not
- I use this to check for duplicates before creating new users

### updateEmailSentStatus(userId)
- Updates the `email_sent` flag to TRUE and sets `email_sent_at` timestamp
- Called after successfully sending an email
- This lets me track which users got their confirmation emails

### getAllUsers()
- Gets all users ordered by newest first
- Not used in the main flow, but useful for debugging
- Could be used for an admin dashboard later

**Error handling approach:**
- All methods return `{success: true/false, ...}` objects
- Specific error codes like 'DUPLICATE_EMAIL', 'USER_NOT_FOUND', 'DATABASE_ERROR'
- Try/catch blocks around all database operations
- Log errors to console but return user-friendly messages

## routes/api.js - The Main API Endpoint

This file handles the `/api/register` POST endpoint - the core functionality of the whole app.

**What happens when someone submits the form:**

1. **Input validation** - Check name and email are provided and valid
2. **Sanitization** - Trim whitespace, convert email to lowercase  
3. **Duplicate check** - See if email already exists in database
4. **Create user** - Insert into database
5. **Send email** - Use the email service
6. **Update status** - Mark email as sent in database
7. **Return response** - Send success/error back to frontend

**Validation logic:**
- Name: required, non-empty string, max 255 chars
- Email: required, valid email format (regex), max 255 chars, converted to lowercase
- Return 400 status for validation errors
- Return 409 status for duplicate emails

**Helper functions I wrote:**
- `validateUserInput()` - checks name and email format
- `formatErrorResponse()` - consistent error message structure  
- `formatSuccessResponse()` - consistent success message structure

**Error handling strategy:**
- Return specific HTTP status codes (400, 409, 500)
- Include timestamps in all responses
- Log detailed errors to console, return user-friendly messages to frontend
- If email sending fails, still register the user (better UX)

## services/emailService.js - Email Sending

This is a singleton class that handles all email functionality using Nodemailer.

**How it works:**
- Initialize once with Gmail SMTP settings from .env file
- Generate HTML and plain text email templates
- Send emails and return success/failure status

**The email template:**
- HTML version with inline CSS for email clients
- Plain text fallback for accessibility
- Includes user's name in subject and greeting
- Shows recipient email address in the body (requirement from ScriptChain)
- ScriptChain branding and professional styling

**Key methods:**

### initialize()
- Sets up Nodemailer transporter with Gmail credentials
- Tests connection to make sure it works
- Only runs once (singleton pattern)
- Gracefully handles missing email credentials

### generateEmailTemplate(name, email)
- Creates both HTML and plain text versions
- Personalizes with user's name and email address
- Professional styling that matches the frontend

### sendConfirmationEmail(name, email)  
- Validates inputs (name and email)
- Generates email content
- Sends via SMTP
- Returns detailed success/error info

**Email configuration:**
- Uses Gmail by default (EMAIL_SERVICE=gmail)
- Supports generic SMTP for other providers
- All credentials stored in .env file
- Falls back gracefully if email service isn't configured

**Why I used a singleton:**
- Only need one email transporter instance
- Connection pooling happens inside Nodemailer
- Initialization only happens once, then reused
- Makes testing easier

## How Everything Connects

1. **server.js** starts up and tests database connection
2. When POST request hits `/api/register`:
   - **routes/api.js** validates the input
   - **models/user.js** checks for duplicates and creates user
   - **services/emailService.js** sends confirmation email
   - **models/user.js** updates email sent status
   - **routes/api.js** returns success/error response

3. All database operations go through **config/database.js** connection pool
4. All responses use consistent format from helper functions
5. Errors are logged server-side but user-friendly messages sent to frontend

## Environment Variables I Need

These go in the `.env` file:

```
PORT=3000
DB_HOST=localhost  
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=email_confirmation
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

## Common Issues I Ran Into

**MySQL connection errors:** Make sure MySQL is running before starting the server. The server will exit if it can't connect.

**Email not sending:** Check your Gmail app password is correct. The user will still get registered even if email fails.

**CORS errors:** Make sure the frontend URL is in the CORS origins array in server.js.

**Duplicate email handling:** The database has a UNIQUE constraint on email, so duplicates are caught at the database level.

## Testing the Backend

```bash
# Health check
curl http://localhost:3000/api/health

# Register user  
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

The backend returns consistent JSON responses with `success`, `message`, and `timestamp` fields.