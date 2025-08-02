import express from "express";
import fs from "fs";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import "dotenv/config";

import { initDatabase, getDatabase } from "./database.js";
import { 
  authenticateToken, 
  requireAdmin, 
  loginUser, 
  registerUser 
} from "./auth.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

// Initialize database
await initDatabase();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/', 'text/', 'application/pdf', 'application/msword'];
    const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
    cb(null, isAllowed);
  }
});

// Configure Vite middleware for React client
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});
app.use(vite.middlewares);

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await loginUser(username, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  const { password_hash, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
});

// User Management Routes
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const users = await db.all(`
      SELECT id, username, email, full_name, role, created_at, last_login 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email } = req.body;
    
    // Users can only edit their own profile unless they're admin
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const db = await getDatabase();
    await db.run(
      'UPDATE users SET full_name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [full_name, email, id]
    );
    
    const updatedUser = await db.get('SELECT id, username, email, full_name, role FROM users WHERE id = ?', [id]);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Task Management Routes
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const tasks = await db.all(`
      SELECT t.*, 
             u1.username as created_by_username,
             u2.username as assigned_to_username
      FROM tasks t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      ORDER BY t.created_at DESC
    `);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, assigned_to, due_date } = req.body;
    const db = await getDatabase();
    
    const result = await db.run(`
      INSERT INTO tasks (title, description, priority, assigned_to, created_by, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [title, description, priority || 'medium', assigned_to, req.user.id, due_date]);

    const task = await db.get(`
      SELECT t.*, 
             u1.username as created_by_username,
             u2.username as assigned_to_username
      FROM tasks t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.id = ?
    `, [result.lastID]);

    io.emit('task_created', task);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigned_to, due_date } = req.body;
    const db = await getDatabase();
    
    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    
    await db.run(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, 
          assigned_to = ?, due_date = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, description, status, priority, assigned_to, due_date, completedAt, id]);

    const task = await db.get(`
      SELECT t.*, 
             u1.username as created_by_username,
             u2.username as assigned_to_username
      FROM tasks t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.id = ?
    `, [id]);

    io.emit('task_updated', task);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    await db.run('DELETE FROM tasks WHERE id = ?', [id]);
    
    io.emit('task_deleted', { id: parseInt(id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File Upload Routes
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const db = await getDatabase();
    const result = await db.run(`
      INSERT INTO files (filename, original_name, mime_type, size, uploaded_by, task_id, file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      req.file.filename,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      req.user.id,
      req.body.task_id || null,
      req.file.path
    ]);

    const file = await db.get('SELECT * FROM files WHERE id = ?', [result.lastID]);
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const files = await db.all(`
      SELECT f.*, u.username as uploaded_by_username
      FROM files f
      JOIN users u ON f.uploaded_by = u.id
      ORDER BY f.created_at DESC
    `);
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files/:id/download', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const file = await db.get('SELECT * FROM files WHERE id = ?', [req.params.id]);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(file.file_path, file.original_name);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chat Routes
app.get('/api/chat/messages', authenticateToken, async (req, res) => {
  try {
    const { channel = 'general', limit = 50 } = req.query;
    const db = await getDatabase();
    
    const messages = await db.all(`
      SELECT m.*, u.username, u.full_name
      FROM chat_messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.channel = ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `, [channel, parseInt(limit)]);

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat/messages', authenticateToken, async (req, res) => {
  try {
    const { message, channel = 'general', message_type = 'text' } = req.body;
    const db = await getDatabase();
    
    const result = await db.run(`
      INSERT INTO chat_messages (message, user_id, channel, message_type)
      VALUES (?, ?, ?, ?)
    `, [message, req.user.id, channel, message_type]);

    const newMessage = await db.get(`
      SELECT m.*, u.username, u.full_name
      FROM chat_messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `, [result.lastID]);

    io.emit('new_message', newMessage);
    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Stats Route
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    
    const [userCount, taskCount, completedTasks, pendingTasks, fileCount] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM users'),
      db.get('SELECT COUNT(*) as count FROM tasks'),
      db.get('SELECT COUNT(*) as count FROM tasks WHERE status = "completed"'),
      db.get('SELECT COUNT(*) as count FROM tasks WHERE status = "pending"'),
      db.get('SELECT COUNT(*) as count FROM files')
    ]);

    const recentTasks = await db.all(`
      SELECT t.*, u.username as assigned_to_username
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      ORDER BY t.created_at DESC
      LIMIT 5
    `);

    res.json({
      users: userCount.count,
      tasks: taskCount.count,
      completedTasks: completedTasks.count,
      pendingTasks: pendingTasks.count,
      files: fileCount.count,
      recentTasks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Original OpenAI Realtime API route
app.get("/token", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "verse",
        }),
      },
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Render the React client
app.use("*", async (req, res, next) => {
  const url = req.originalUrl;

  try {
    const template = await vite.transformIndexHtml(
      url,
      fs.readFileSync("./client/index.html", "utf-8"),
    );
    
    // For now, disable SSR and just send the empty template
    const html = template.replace(`<!--ssr-outlet-->`, '');
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    vite.ssrFixStacktrace(e);
    next(e);
  }
});

server.listen(port, () => {
  console.log(`🚀 Complete System running on http://localhost:${port}`);
  console.log(`📊 Dashboard: http://localhost:${port}/dashboard`);
  console.log(`🤖 AI Chat: http://localhost:${port}/ai-chat`);
  console.log(`📋 Tasks: http://localhost:${port}/tasks`);
  console.log(`💬 Chat: http://localhost:${port}/chat`);
  console.log(`👤 Admin login: admin / admin123`);
});
