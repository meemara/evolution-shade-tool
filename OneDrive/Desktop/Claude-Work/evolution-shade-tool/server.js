import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import initSqlJs from 'sql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// --- Database Setup ---
const dbPath = process.env.DB_PATH || join(__dirname, 'data', 'shade-tool.db');
mkdirSync(dirname(dbPath), { recursive: true });

let db;

function now() {
  return new Date().toISOString().replace('T', ' ').replace('Z', '').split('.')[0];
}

async function initDb() {
  const SQL = await initSqlJs();

  // Load existing database file if it exists
  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables (no datetime('now') defaults — sql.js doesn't support them)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      client TEXT DEFAULT '',
      address TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_by INTEGER,
      updated_by INTEGER,
      created_at TEXT,
      updated_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS shades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      shade_data TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    )
  `);

  // Seed team members
  const seedUsers = ['Mark', 'Tony', 'Ray Carter', 'Caleb', 'Cal', 'Kris Brant'];
  for (const name of seedUsers) {
    const existing = db.exec("SELECT id FROM users WHERE name = ?", [name]);
    if (existing.length === 0 || existing[0].values.length === 0) {
      db.run('INSERT INTO users (name, created_at) VALUES (?, ?)', [name, now()]);
    }
  }

  persistDb();
  console.log('Database initialized.');
}

// Write database to disk
function persistDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(dbPath, buffer);
}

// Helper: run a SELECT and return array of row objects
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Helper: run a SELECT and return first row object or null
function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Helper: run INSERT/UPDATE/DELETE, persist, return last insert rowid
function execute(sql, params = []) {
  db.run(sql, params);
  const result = db.exec("SELECT last_insert_rowid() as id");
  const lastId = result.length > 0 ? result[0].values[0][0] : null;
  persistDb();
  return { lastId };
}

// --- API Routes ---

// Get all users
app.get('/api/users', (req, res) => {
  const users = queryAll('SELECT id, name FROM users ORDER BY name');
  res.json(users);
});

// Get all projects (with shade count and user info)
app.get('/api/projects', (req, res) => {
  const { search } = req.query;
  let sql = `
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
    sql += ` WHERE p.name LIKE ? OR p.client LIKE ? OR p.address LIKE ?`;
    const term = `%${search}%`;
    params.push(term, term, term);
  }
  sql += ` ORDER BY p.updated_at DESC`;
  const projects = queryAll(sql, params);
  res.json(projects);
});

// Get single project with shades
app.get('/api/projects/:id', (req, res) => {
  const project = queryOne(`
    SELECT p.*, u1.name as created_by_name, u2.name as updated_by_name
    FROM projects p
    LEFT JOIN users u1 ON p.created_by = u1.id
    LEFT JOIN users u2 ON p.updated_by = u2.id
    WHERE p.id = ?
  `, [Number(req.params.id)]);

  if (!project) return res.status(404).json({ error: 'Project not found' });

  const shades = queryAll(
    'SELECT * FROM shades WHERE project_id = ? ORDER BY sort_order',
    [Number(req.params.id)]
  );

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

  const ts = now();
  const { lastId } = execute(
    'INSERT INTO projects (name, client, address, notes, created_by, updated_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, client || '', address || '', notes || '', userId, userId, ts, ts]
  );

  const project = queryOne('SELECT * FROM projects WHERE id = ?', [lastId]);
  res.status(201).json(project);
});

// Update project
app.put('/api/projects/:id', (req, res) => {
  const { name, client, address, notes, userId } = req.body;
  execute(
    `UPDATE projects SET name = ?, client = ?, address = ?, notes = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
    [name, client || '', address || '', notes || '', userId, now(), Number(req.params.id)]
  );

  const project = queryOne('SELECT * FROM projects WHERE id = ?', [Number(req.params.id)]);
  res.json(project);
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
  execute('DELETE FROM shades WHERE project_id = ?', [Number(req.params.id)]);
  execute('DELETE FROM projects WHERE id = ?', [Number(req.params.id)]);
  res.json({ success: true });
});

// Save shades for a project (replaces all shades)
app.put('/api/projects/:id/shades', (req, res) => {
  const { shades, userId } = req.body;
  const projectId = Number(req.params.id);
  const ts = now();

  // Delete existing shades
  db.run('DELETE FROM shades WHERE project_id = ?', [projectId]);

  // Insert new shades
  for (let i = 0; i < shades.length; i++) {
    const { _db_id, _sort_order, ...shadeData } = shades[i];
    db.run(
      'INSERT INTO shades (project_id, shade_data, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [projectId, JSON.stringify(shadeData), i, ts, ts]
    );
  }

  // Update project timestamp
  db.run(
    `UPDATE projects SET updated_by = ?, updated_at = ? WHERE id = ?`,
    [userId, ts, projectId]
  );

  persistDb();
  res.json({ success: true, count: shades.length });
});

// --- Static files ---
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// --- Start ---
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Evolution Shade Tool running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
