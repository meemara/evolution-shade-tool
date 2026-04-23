import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// --- Database Setup ---
const dbPath = process.env.DB_PATH || join(__dirname, 'data', 'shade-tool.db');
// Ensure data directory exists
import { mkdirSync } from 'fs';
mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    client TEXT DEFAULT '',
    address TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS shades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    shade_data TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed team members
const seedUsers = [
  'Mark', 'Tony', 'Ray Carter', 'Caleb', 'Cal', 'Kris Brant'
];
const insertUser = db.prepare('INSERT OR IGNORE INTO users (name) VALUES (?)');
for (const name of seedUsers) {
  insertUser.run(name);
}

// --- API Routes ---

// Get all users
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT id, name FROM users ORDER BY name').all();
  res.json(users);
});

// Get all projects (with shade count and user info)
app.get('/api/projects', (req, res) => {
  const { search } = req.query;
  let query = `
    SELECT p.*,
      u1.name as created_by_name,
      u2.name as updated_by_name,
      (SELECT COUNT(*) FROM shades WHERE project_id = p.id) as shade_count
    FROM projects p
    LEFT JOIN users u1 ON p.created_by = u1.id
    LEFT JOIN users u2 ON p.updated_by = u2.id
  `;
  const params = [];
  if (search) {
    query += ` WHERE p.name LIKE ? OR p.client LIKE ? OR p.address LIKE ?`;
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  query += ` ORDER BY p.updated_at DESC`;
  const projects = db.prepare(query).all(...params);
  res.json(projects);
});

// Get single project with shades
app.get('/api/projects/:id', (req, res) => {
  const project = db.prepare(`
    SELECT p.*, u1.name as created_by_name, u2.name as updated_by_name
    FROM projects p
    LEFT JOIN users u1 ON p.created_by = u1.id
    LEFT JOIN users u2 ON p.updated_by = u2.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!project) return res.status(404).json({ error: 'Project not found' });

  const shades = db.prepare(
    'SELECT * FROM shades WHERE project_id = ? ORDER BY sort_order'
  ).all(req.params.id);

  project.shades = shades.map(s => ({
    ...JSON.parse(s.shade_data),
    _db_id: s.id,
    _sort_order: s.sort_order
  }));

  res.json(project);
});

// Create project
app.post('/api/projects', (req, res) => {
  const { name, client, address, notes, userId } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });

  const result = db.prepare(
    'INSERT INTO projects (name, client, address, notes, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, client || '', address || '', notes || '', userId, userId);

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(project);
});

// Update project
app.put('/api/projects/:id', (req, res) => {
  const { name, client, address, notes, userId } = req.body;
  db.prepare(`
    UPDATE projects SET name = ?, client = ?, address = ?, notes = ?, updated_by = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(name, client || '', address || '', notes || '', userId, req.params.id);

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  res.json(project);
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Save shades for a project (replaces all shades)
app.put('/api/projects/:id/shades', (req, res) => {
  const { shades, userId } = req.body;
  const projectId = req.params.id;

  const saveShades = db.transaction(() => {
    db.prepare('DELETE FROM shades WHERE project_id = ?').run(projectId);
    const insert = db.prepare(
      'INSERT INTO shades (project_id, shade_data, sort_order) VALUES (?, ?, ?)'
    );
    shades.forEach((shade, i) => {
      const { _db_id, _sort_order, ...shadeData } = shade;
      insert.run(projectId, JSON.stringify(shadeData), i);
    });
    db.prepare(`UPDATE projects SET updated_by = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(userId, projectId);
  });

  saveShades();
  res.json({ success: true, count: shades.length });
});

// --- Static files ---
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Evolution Shade Tool running on port ${PORT}`);
});
