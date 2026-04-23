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

async function initDb() {
  const SQL = await initSqlJs();

  // Load existing database file if it exists
  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
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
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS shades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      shade_data TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Seed team members
  const seedUsers = ['Mark', 'Tony', 'Ray Carter', 'Caleb', 'Cal', 'Kris Brant'];
  const insertUser = db.prepare('INSERT OR IGNORE INTO users (name) VALUES (?)');
  for (const name of seedUsers) {
    insertUser.bind([name]);
    insertUser.step();
    insertUser.reset();
  }
  insertUser.free();

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
  stmt.bind(params);
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

// Helper: run INSERT/UPDATE/DELETE, persist, return info
function execute(sql, params = []) {
  db.run(sql, params);
  persistDb();
  return { lastId: db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] };
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

  const { lastId } = execute(
    'INSERT INTO projects (name, client, address, notes, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
    [name, client || '', address || '', notes || '', userId, userId]
  );

  const project = queryOne('SELECT * FROM projects WHERE id = ?', [lastId]);
  res.status(201).json(project);
});

// Update project
app.put('/api/projects/:id', (req, res) => {
  const { name, client, address, notes, userId } = req.body;
  execute(
    `UPDATE projects SET name = ?, client = ?, address = ?, notes = ?, updated_by = ?, updated_at = datetime('now') WHERE id = ?`,
    [name, client || '', address || '', notes || '', userId, Number(req.params.id)]
  );

  const project = queryOne('SELECT * FROM projects WHERE id = ?', [Number(req.params.id)]);
  res.json(project);
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
  // Delete shades first (sql.js doesn't support ON DELETE CASCADE reliably)
  execute('DELETE FROM shades WHERE project_id = ?', [Number(req.params.id)]);
  execute('DELETE FROM projects WHERE id = ?', [Number(req.params.id)]);
  res.json({ success: true });
});

// Save shades for a project (replaces all shades)
app.put('/api/projects/:id/shades', (req, res) => {
  const { shades, userId } = req.body;
  const projectId = Number(req.params.id);

  // Delete existing shades
  db.run('DELETE FROM shades WHERE project_id = ?', [projectId]);

  // Insert new shades
  const insertStmt = db.prepare(
    'INSERT INTO shades (project_id, shade_data, sort_order) VALUES (?, ?, ?)'
  );
  shades.forEach((shade, i) => {
    const { _db_id, _sort_order, ...shadeData } = shade;
    insertStmt.bind([projectId, JSON.stringify(shadeData), i]);
    insertStmt.step();
    insertStmt.reset();
  });
  insertStmt.free();

  // Update project timestamp
  db.run(
    `UPDATE projects SET updated_by = ?, updated_at = datetime('now') WHERE id = ?`,
    [userId, projectId]
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
