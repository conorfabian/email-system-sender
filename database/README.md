# Database Schema Notes

My notes on how I designed the database for this email confirmation system.

## schema.sql - Database Setup

This file creates the entire database structure. Pretty simple - just one table since this is a straightforward app.

## Database Design Decisions

**Why I called it `email_confirmation`:**
- Descriptive name that matches the project purpose
- Easy to remember and type
- Not too long or complicated

**Why just one table:**
- This is a simple app that only needs to store user registrations
- No complex relationships needed
- Keeps it fast and easy to understand
- Could always add more tables later if needed

## The `users` Table Breakdown

Here's what each field does and why I chose it:

### id (Primary Key)
```sql
id INT AUTO_INCREMENT PRIMARY KEY
```
- **What:** Standard auto-incrementing ID
- **Why:** Every table needs a primary key, and auto-increment makes it easy
- **Type:** INT because I don't expect millions of users for this demo
- **Usage:** Referenced when updating email sent status

### name  
```sql
name VARCHAR(255) NOT NULL
```
- **What:** User's full name as they entered it
- **Why:** Need this for the email greeting ("Hello John,")
- **Type:** VARCHAR(255) because names can vary in length
- **NOT NULL:** Required field - can't register without a name
- **Usage:** Displayed in the confirmation email

### email
```sql
email VARCHAR(255) NOT NULL UNIQUE
```
- **What:** User's email address
- **Why:** This is where we send the confirmation email
- **Type:** VARCHAR(255) - standard length for email addresses
- **NOT NULL:** Obviously required
- **UNIQUE:** Can't have duplicate emails - each person can only register once
- **Usage:** Primary way to identify users, recipient of confirmation email

### created_at
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```
- **What:** When the user registered
- **Why:** Good to track when registrations happen, useful for analytics
- **Type:** TIMESTAMP for date and time
- **Default:** Automatically set when row is inserted
- **Usage:** Could be used for sorting, reporting, or cleanup

### email_sent
```sql
email_sent BOOLEAN DEFAULT FALSE
```
- **What:** Whether we successfully sent the confirmation email
- **Why:** Need to track if email actually went out (email could fail)
- **Type:** BOOLEAN - simple true/false
- **Default:** FALSE because email hasn't been sent yet when user is created
- **Usage:** Updated to TRUE after successful email sending

### email_sent_at
```sql
email_sent_at TIMESTAMP NULL
```
- **What:** Exactly when the email was sent
- **Why:** Useful for debugging email issues and tracking timing
- **Type:** TIMESTAMP for precise timing
- **NULL:** Allows NULL because email might not be sent yet
- **Usage:** Set when email_sent is updated to TRUE

## Indexes I Added

### Email Index
```sql
INDEX idx_email (email)
```
- **Why:** Email lookups are common (checking for duplicates)
- **Performance:** Makes the duplicate check in registration super fast
- **Usage:** Every time someone tries to register, we check if email exists

### Created At Index  
```sql
INDEX idx_created_at (created_at)
```
- **Why:** Might want to sort users by registration date
- **Performance:** Fast sorting and filtering by date
- **Usage:** Could be used for reports or displaying recent users

## The Registration Flow

Here's how the database gets used during a typical registration:

1. **Check for duplicate:** `SELECT * FROM users WHERE email = ?`
2. **Create user:** `INSERT INTO users (name, email) VALUES (?, ?)`
3. **Send email** (happens in the backend)
4. **Update email status:** `UPDATE users SET email_sent = TRUE, email_sent_at = NOW() WHERE id = ?`

## Why I Track Email Status

Originally I thought about just inserting the user and sending the email, but I realized:

- **Email could fail** - Gmail might be down, credentials wrong, etc.
- **Need to track success** - Important to know if users actually got the email
- **Debugging** - If someone says they didn't get an email, I can check the database
- **Retry logic** - Could later add a system to retry failed emails

So the flow is:
1. Insert user with `email_sent = FALSE`
2. Try to send email
3. If successful, update `email_sent = TRUE` and set `email_sent_at`
4. If failed, leave `email_sent = FALSE` so I know to retry later

## Sample Data

After running the app a few times, the table looks like this:

```
+----+-------------+------------------------+---------------------+------------+---------------------+
| id | name        | email                  | created_at          | email_sent | email_sent_at       |
+----+-------------+------------------------+---------------------+------------+---------------------+
| 1  | John Smith  | john@temp-mail.org     | 2025-07-28 15:30:15 | 1          | 2025-07-28 15:30:16 |
| 2  | Jane Doe    | jane@guerrillamail.com | 2025-07-28 16:45:22 | 1          | 2025-07-28 16:45:23 |
| 3  | Test User   | broken@email.com       | 2025-07-28 17:20:10 | 0          | NULL                |
+----+-------------+------------------------+---------------------+------------+---------------------+
```

You can see user #3 has `email_sent = 0` - that's probably because the email bounced or there was an SMTP error.

## Running the Schema

To set up the database:

```bash
mysql -u root -p < schema.sql
```

This will:
1. Create the `email_confirmation` database if it doesn't exist
2. Create the `users` table with all the fields and indexes
3. Show the table structure with `DESCRIBE users`

## Database Performance

Even though this is a simple demo, I thought about performance:

- **Primary key** is clustered index (MySQL default) - fast lookups by ID
- **Email index** makes duplicate checking fast even with thousands of users  
- **Created_at index** makes date-based queries fast
- **VARCHAR(255)** is reasonable size - not too big, not too small

For a production app with millions of users, I'd consider:
- Partitioning by date
- Separate table for email sending attempts
- Archive old data to keep main table fast

## Common Queries I Use

**Check if email exists:**
```sql
SELECT id FROM users WHERE email = 'test@example.com';
```

**Get recent registrations:**
```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
```

**Find users whose emails failed:**
```sql
SELECT * FROM users WHERE email_sent = FALSE;
```

**Count successful emails:**
```sql
SELECT COUNT(*) FROM users WHERE email_sent = TRUE;
```

## Database Maintenance

**Backup the data:**
```bash
mysqldump -u root -p email_confirmation > backup.sql
```

**Clear test data:**
```sql
DELETE FROM users WHERE email LIKE '%temp-mail%';
DELETE FROM users WHERE email LIKE '%guerrillamail%';
```

**Reset auto-increment:**
```sql
ALTER TABLE users AUTO_INCREMENT = 1;
```

This keeps things clean during development and testing.