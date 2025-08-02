import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDatabase } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  const db = await getDatabase();
  const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.id]);
  
  if (!user) {
    return res.status(403).json({ error: 'User not found' });
  }

  req.user = user;
  next();
}

export async function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export async function loginUser(username, password) {
  const db = await getDatabase();
  const user = await db.get(
    'SELECT * FROM users WHERE username = ? OR email = ?', 
    [username, username]
  );

  if (!user) {
    throw new Error('User not found');
  }

  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid password');
  }

  // Update last login
  await db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

  const token = generateToken(user);
  const { password_hash, ...userWithoutPassword } = user;
  
  return { user: userWithoutPassword, token };
}

export async function registerUser(userData) {
  const db = await getDatabase();
  const { username, email, password, full_name } = userData;

  // Check if user already exists
  const existingUser = await db.get(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username, email]
  );

  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(password);
  
  const result = await db.run(`
    INSERT INTO users (username, email, password_hash, full_name)
    VALUES (?, ?, ?, ?)
  `, [username, email, hashedPassword, full_name]);

  const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
  const { password_hash, ...userWithoutPassword } = user;
  const token = generateToken(user);

  return { user: userWithoutPassword, token };
}