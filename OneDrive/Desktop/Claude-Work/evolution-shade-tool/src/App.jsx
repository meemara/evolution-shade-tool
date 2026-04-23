import { useState } from 'react';
import ProjectSetup from './components/ProjectSetup';
import ShadeList from './components/ShadeList';
import ShadeWizard from './components/ShadeWizard';
import './App.css';

function App() {
  const [view, setView] = useState('setup');
  const [project, setProject] = useState({
    name: '',
    client: '',
    address: '',
    notes: '',
  });
  const [shades, setShades] = useState([]);
  const [editingShadeIndex, setEditingShadeIndex] = useState(null);

  const handleProjectSave = (projectData) => {
    setProject(projectData);
    setView('list');
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
      setShades(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDuplicateShade = (index) => {
    const shade = { ...shades[index], id: Date.now() + Math.random(), name: shades[index].name + ' (Copy)' };
    setShades(prev => [...prev, shade]);
  };

  const handleWizardComplete = (shade) => {
    if (editingShadeIndex !== null) {
      setShades(prev => prev.map((s, i) => i === editingShadeIndex ? shade : s));
    } else {
      setShades(prev => [...prev, shade]);
    }
    setView('list');
  };

  const handleWizardCancel = () => {
    setView('list');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 40 40" width="40" height="40">
                <circle cx="20" cy="20" r="18" fill="#8CC63F" />
                <text x="20" y="26" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial">AV</text>
              </svg>
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
          {view !== 'setup' && (
            <button className="btn btn-text" onClick={() => setView('setup')}>
              Edit Project
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {view === 'setup' && (
          <ProjectSetup project={project} onSave={handleProjectSave} />
        )}
        {view === 'list' && (
          <ShadeList
            project={project}
            shades={shades}
            onAdd={handleAddShade}
            onEdit={handleEditShade}
            onDelete={handleDeleteShade}
            onDuplicate={handleDuplicateShade}
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
