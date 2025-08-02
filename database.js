import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

let db = null;

export async function initDatabase() {
  if (db) return db;

  // Create database using sqlite3 directly
  const database = await new Promise((resolve, reject) => {
    const dbInstance = new sqlite3.Database('./database.sqlite', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(dbInstance);
      }
    });
  });

  // Create wrapper object with promise-based methods
  db = {
    _db: database,
    
    get: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        database.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },

    all: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        database.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    },

    run: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        database.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    },

    close: () => {
      return new Promise((resolve, reject) => {
        database.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  };

  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON');

  // Create users table
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `);

  // Create tasks table
  await db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      assigned_to INTEGER,
      created_by INTEGER NOT NULL,
      due_date DATETIME,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Create files table
  await db.run(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT,
      size INTEGER,
      uploaded_by INTEGER NOT NULL,
      task_id INTEGER,
      file_path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id),
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    )
  `);

  // Create chat messages table
  await db.run(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      channel TEXT DEFAULT 'general',
      message_type TEXT DEFAULT 'text',
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create AI conversations table
  await db.run(`
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_id TEXT,
      conversation_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create admin user if not exists
  const adminExists = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run(`
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?, ?)
    `, ['admin', 'admin@system.local', hashedPassword, 'System Administrator', 'admin']);
    
    console.log('Created admin user: admin / admin123');
  }

  console.log('Database initialized successfully');
  return db;
}

export async function getDatabase() {
  if (!db) {
    await initDatabase();
  }
  return db;
}

export { db };