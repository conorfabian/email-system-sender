# Database Notes

Simple database design - just one table called users in the email_confirmation database. The id field is auto-incrementing primary key, name is VARCHAR(255) NOT NULL for the email greeting, and email is VARCHAR(255) NOT NULL UNIQUE to prevent duplicates. The created_at timestamp gets set automatically when someone registers.

The interesting part is email tracking. I have email_sent as boolean defaulting to FALSE and email_sent_at as nullable timestamp. Originally I was going to insert user and send email in one step but realized email could fail for various reasons. So now the flow is: insert user with email_sent false, try to send email, update email_sent to true only if it works. This way I can see which users got their emails and which didn't.

Added indexes on email (for duplicate checking) and created_at (for sorting). The registration flow hits the database three times - SELECT to check duplicates, INSERT to create user, UPDATE to mark email sent. When I look at the data I can see exactly what happened - most have email_sent = 1 with timestamp, but failed ones show email_sent = 0 and NULL email_sent_at.

To set up: mysql -u root -p < schema.sql creates everything. For testing: SELECT * FROM users ORDER BY created_at DESC for recent registrations or SELECT * FROM users WHERE email_sent = FALSE for failed emails. The design is simple but handles the edge cases and MySQL performs well with this kind of table.