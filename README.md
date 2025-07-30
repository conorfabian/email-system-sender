# Email System Sender

A simple web app that collects user info and sends confirmation emails.

## What it uses
- AngularJS (frontend)
- Node.js + Express (backend) 
- MySQL (database)

## Prerequisites

You need:
- Node.js 
- MySQL
- A Gmail account for sending emails

## Quick Setup

1. Clone this repo
2. `cd backend && npm install`
3. Create `.env` file (copy from `.env.example`)
4. Set up MySQL database (see below)
5. `npm run dev` to start
6. Open `frontend/index.html` in browser

## Database Setup

Run this in MySQL:
```bash
mysql -u root -p < database/schema.sql
```

Done!

## Environment Variables

Make a `.env` file in `backend/` folder:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=email_confirmation
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

For Gmail: enable 2FA, then create an "App Password" in your Google Account settings.

## How to Run

```bash
cd backend
npm install
npm run dev
```

Then open `frontend/index.html` in your browser. Done!

## API

- `GET /api/health` - Check if server is running
- `POST /api/register` - Register user and send email

Send JSON like `{"name": "John", "email": "john@example.com"}` to register.

## Testing

Use temporary email services to test:
- temp-mail.org
- 10minutemail.com
- guerrillamail.com

The app handles duplicates, validates emails, and sends confirmation emails with the user's name and email address.

## What it does

1. User fills out a form with name and email
2. Data gets saved to MySQL database
3. Confirmation email sent with their name and email address included
4. Form shows success/error messages
5. Prevents duplicate emails

## Known Issues

- Need to set up Gmail app password for emails to work
- MySQL must be running before starting the app
- No rate limiting (would spam with many requests)

## Project Structure

```
email-confirmation-system/
├── backend/                 # Node.js server
│   ├── config/database.js   # Database connection
│   ├── models/user.js       # User data handling
│   ├── routes/api.js        # API endpoints
│   ├── services/emailService.js # Email sending
│   ├── server.js            # Main server file
│   └── package.json         # Dependencies
├── frontend/                # AngularJS app
│   ├── index.html           # Main page
│   ├── app.js               # AngularJS setup
│   ├── controllers/emailController.js # Form logic
│   ├── services/apiService.js # API calls
│   └── styles.css           # Styling
└── database/schema.sql      # Database setup
```

---

Built for ScriptChain interview assignment by Conor Fabian, July 2025.