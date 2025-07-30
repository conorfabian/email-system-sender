# Backend Notes

The backend is pretty straightforward - Express server with MySQL and email sending. The server.js file loads environment variables, sets up CORS (had to include 'file://' and 'null' origins since I'm serving the frontend as a file), and tests the database connection before starting. If MySQL isn't running it just fails fast which is better than pretending everything's fine.

The database connection pooling in config/database.js creates 10 shared connections instead of opening new ones for every query. The getConnection function handles creating the pool and each query borrows a connection then gives it back. All wrapped in try/catch because database connections fail in weird ways.

My User model has static methods for createUser, getUserByEmail, updateEmailSentStatus, and getAllUsers. The createUser method catches duplicate email errors specifically, getUserByEmail is for checking duplicates, and updateEmailSentStatus tracks which users actually got their emails. All methods return consistent objects with success flags and error codes.

The API routes in routes/api.js handle the /api/register endpoint. It validates input, sanitizes data (trim whitespace, lowercase email), checks for duplicates, creates the user, sends email, and updates the email status. Returns specific HTTP codes - 400 for validation, 409 for duplicates, 500 for server errors. If email fails I still register the user for better UX.

The email service is a singleton that sets up Nodemailer with Gmail, generates HTML and plain text templates, and sends emails. The template includes the user's name and email address as required. Falls back gracefully if email credentials aren't configured so the app still works for demos.

The flow is: server starts and tests database, POST to /api/register validates input, user model checks duplicates and creates user, email service sends confirmation, user model updates email status, routes return response. Need environment variables for database (PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) and email (EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS). Common issues are MySQL not running, wrong Gmail password, and CORS errors.