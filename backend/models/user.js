const database = require('../config/database');

class User {
  static async createUser(name, email) {
    try {
      const connection = await database.getConnection();
      
      const query = `
        INSERT INTO users (name, email, created_at, email_sent, email_sent_at)
        VALUES (?, ?, NOW(), FALSE, NULL)
      `;
      
      const [result] = await connection.execute(query, [name, email]);
      connection.release();
      
      console.log(`User created successfully: ID ${result.insertId}, Email: ${email}`);
      
      return {
        success: true,
        userId: result.insertId,
        message: 'User created successfully'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return {
          success: false,
          error: 'DUPLICATE_EMAIL',
          message: 'This email address is already registered'
        };
      }
      
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to create user'
      };
    }
  }

  static async getUserByEmail(email) {
    try {
      const connection = await database.getConnection();
      
      const query = `
        SELECT id, name, email, created_at, email_sent, email_sent_at
        FROM users
        WHERE email = ?
      `;
      
      const [rows] = await connection.execute(query, [email]);
      connection.release();
      
      if (rows.length === 0) {
        return {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        };
      }
      
      console.log(`User found: ${email}`);
      
      return {
        success: true,
        user: rows[0]
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to retrieve user'
      };
    }
  }

  static async updateEmailSentStatus(userId) {
    try {
      const connection = await database.getConnection();
      
      const query = `
        UPDATE users
        SET email_sent = TRUE, email_sent_at = NOW()
        WHERE id = ?
      `;
      
      const [result] = await connection.execute(query, [userId]);
      connection.release();
      
      if (result.affectedRows === 0) {
        return {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        };
      }
      
      console.log(`Email status updated for user ID: ${userId}`);
      
      return {
        success: true,
        message: 'Email status updated successfully'
      };
    } catch (error) {
      console.error('Error updating email sent status:', error);
      
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to update email status'
      };
    }
  }

  static async getAllUsers() {
    try {
      const connection = await database.getConnection();
      
      const query = `
        SELECT id, name, email, created_at, email_sent, email_sent_at
        FROM users
        ORDER BY created_at DESC
      `;
      
      const [rows] = await connection.execute(query);
      connection.release();
      
      return {
        success: true,
        users: rows
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      
      return {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to retrieve users'
      };
    }
  }
}

module.exports = User;