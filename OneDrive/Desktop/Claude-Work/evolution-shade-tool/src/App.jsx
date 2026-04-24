import { useState, useCallback } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProjectSetup from './components/ProjectSetup';
import ShadeList from './components/ShadeList';
import ShadeWizard from './components/ShadeWizard';
import { api } from './utils/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [projectId, setProjectId] = useState(null);
  const [project, setProject] = useState({ name: '', client: '', address: '', notes: '' });
  const [shades, setShades] = useState([]);
  const [editingShadeIndex, setEditingShadeIndex] = useState(null);
  const [saving, setSaving] = useState(false);

  // --- Auth ---
  const handleLogin = (u) => {
    setUser(u);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setProjectId(null);
    setProject({ name: '', client: '', address: '', notes: '' });
    setShades([]);
    setView('dashboard');
  };

  // --- Dashboard ---
  const handleNewProject = () => {
    setProjectId(null);
    setProject({ name: '', client: '', address: '', notes: '' });
    setShades([]);
    setView('setup');
  };

  const handleOpenProject = useCallback(async (id) => {
    try {
      const data = await api.getProject(id);
      setProjectId(data.id);
      setProject({ name: data.name, client: data.client, address: data.address, notes: data.notes });
      setShades(data.shades || []);
      setView('list');
    } catch (err) {
      alert('Failed to open project: ' + err.message);
    }
  }, []);

  // --- Project Setup ---
  const handleProjectSave = async (projectData) => {
    try {
      setSaving(true);
      if (projectId) {
        await api.updateProject(projectId, { ...projectData, userId: user.id });
        setProject(projectData);
      } else {
        const created = await api.createProject({ ...projectData, userId: user.id });
        setProjectId(created.id);
        setProject(projectData);
      }
      setView('list');
    } catch (err) {
      alert('Failed to save project: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Shades ---
  const saveShades = async (newShades) => {
    if (!projectId) return;
    try {
      await api.saveShades(projectId, newShades, user.id);
    } catch (err) {
      console.error('Failed to save shades:', err);
    }
  };

  const handleAddShade = () => {
    setEditingShadeIndex(null);
    setView('wizard');
  };

  const handleEditShade = (index) => {
    setEditingShadeIndex(index);
    setView('wizard');
  };

  const handleDeleteShade = (index) => {
    if (window.confirm('Delete this shade configuration?')) {
      const newShades = shades.filter((_, i) => i !== index);
      setShades(newShades);
      saveShades(newShades);
    }
  };

  const handleDuplicateShade = (index) => {
    const shade = { ...shades[index], id: Date.now() + Math.random(), name: shades[index].name + ' (Copy)' };
    const newShades = [...shades, shade];
    setShades(newShades);
    saveShades(newShades);
  };

  const handleWizardComplete = (shade) => {
    let newShades;
    if (editingShadeIndex !== null) {
      newShades = shades.map((s, i) => i === editingShadeIndex ? shade : s);
    } else {
      newShades = [...shades, shade];
    }
    setShades(newShades);
    saveShades(newShades);
    setView('list');
  };

  const handleWizardCancel = () => {
    setView('list');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setProjectId(null);
    setProject({ name: '', client: '', address: '', notes: '' });
    setShades([]);
  };

  // --- Login gate ---
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo" onClick={handleBackToDashboard} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">
              <img src="./evolution-logo.svg" alt="Evolution AV" width="40" height="40" />
            </div>
            <div className="logo-text">
              <span className="company-name">Evolution</span>
              <span className="company-tagline">Audio &bull; Video &bull; Automation</span>
            </div>
          </div>
        </div>
        <div className="header-center">
          <h1>Shade Configuration Tool</h1>
        </div>
        <div className="header-right">
          <span className="user-name">{user.name}</span>
          {view !== 'dashboard' && view !== 'setup' && (
            <button className="btn btn-text" onClick={handleBackToDashboard}>
              All Projects
            </button>
          )}
          {view === 'list' && (
            <button className="btn btn-text" onClick={() => setView('setup')}>
              Edit Project
            </button>
          )}
          <button className="btn btn-text btn-sm" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="app-main">
        {view === 'dashboard' && (
          <Dashboard user={user} onOpenProject={handleOpenProject} onNewProject={handleNewProject} />
        )}
        {view === 'setup' && (
          <ProjectSetup
            project={project}
            onSave={handleProjectSave}
            onCancel={projectId ? () => setView('list') : handleBackToDashboard}
            saving={saving}
          />
        )}
        {view === 'list' && (
          <ShadeList
            project={project}
            shades={shades}
            onAdd={handleAddShade}
            onEdit={handleEditShade}
            onDelete={handleDeleteShade}
            onDuplicate={handleDuplicateShade}
            onClose={handleBackToDashboard}
          />
        )}
        {view === 'wizard' && (
          <ShadeWizard
            shade={editingShadeIndex !== null ? shades[editingShadeIndex] : null}
            shadeCount={shades.length}
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
          />
        )}
      </main>
    </div>
  );
}

export default App;
