import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export default function Dashboard({ user, onOpenProject, onNewProject }) {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async (searchTerm) => {
    try {
      const data = await api.getProjects(searchTerm);
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects('');
  }, [loadProjects]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, loadProjects]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete project "${name}" and all its shades? This cannot be undone.`)) return;
    try {
      await api.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete project: ' + err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'Z');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="card card-wide">
      <div className="card-header">
        <div className="card-header-row">
          <div>
            <h2>Projects</h2>
            <p className="subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="card-header-actions">
            <button className="btn btn-primary" onClick={onNewProject}>
              + New Project
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-search">
        <input
          type="text"
          placeholder="Search by project name, client, or address..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        {search && (
          <button className="btn btn-text btn-sm" onClick={() => setSearch('')}>Clear</button>
        )}
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading projects...</p></div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="#6D6E71" strokeWidth="2">
              <rect x="8" y="4" width="48" height="56" rx="4" />
              <line x1="20" y1="20" x2="44" y2="20" />
              <line x1="20" y1="32" x2="44" y2="32" />
              <line x1="20" y1="44" x2="36" y2="44" />
            </svg>
          </div>
          {search ? (
            <>
              <h3>No matching projects</h3>
              <p>No projects match "{search}". Try a different search or create a new project.</p>
            </>
          ) : (
            <>
              <h3>No projects yet</h3>
              <p>Create your first shade configuration project to get started.</p>
            </>
          )}
          <button className="btn btn-primary" onClick={onNewProject}>+ Create First Project</button>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map(p => (
            <div key={p.id} className="project-card" onClick={() => onOpenProject(p.id)}>
              <div className="project-card-header">
                <h3>{p.name}</h3>
                <button
                  className="btn btn-sm btn-icon btn-danger"
                  onClick={e => { e.stopPropagation(); handleDelete(p.id, p.name); }}
                  title="Delete project"
                >
                  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              {p.client && <p className="project-client">{p.client}</p>}
              {p.address && <p className="project-address">{p.address}</p>}
              <div className="project-meta">
                <span className="shade-badge">{p.shade_count} shade{p.shade_count !== 1 ? 's' : ''}</span>
                <span className="project-date">Updated {formatDate(p.updated_at)}</span>
              </div>
              {p.updated_by_name && (
                <span className="project-user">by {p.updated_by_name}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
