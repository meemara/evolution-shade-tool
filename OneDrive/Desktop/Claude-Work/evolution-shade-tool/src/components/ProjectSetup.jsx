import { useState } from 'react';

export default function ProjectSetup({ project, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...project });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Please enter a project name.');
      return;
    }
    if (!form.client.trim()) {
      alert('Please enter a client / builder name.');
      return;
    }
    if (!form.notes.trim()) {
      alert('Please enter a project summary.');
      return;
    }
    onSave(form);
  };

  return (
    <div className="card card-narrow">
      <div className="card-header">
        <h2>{project.name ? 'Edit Project' : 'New Project'}</h2>
        <p className="subtitle">Enter the project details to get started.</p>
      </div>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">Project Name *</label>
          <input
            id="name" name="name" type="text"
            value={form.name} onChange={handleChange}
            placeholder="e.g. Smith Residence"
            autoFocus
          />
        </div>
        <div className="form-group">
          <label htmlFor="client">Client / Builder Name *</label>
          <input
            id="client" name="client" type="text"
            value={form.client} onChange={handleChange}
            placeholder="e.g. John Smith"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            id="address" name="address" type="text"
            value={form.address} onChange={handleChange}
            placeholder="e.g. 123 Main St, Nashville, TN"
          />
        </div>
        <div className="form-group">
          <label htmlFor="notes">Summary *</label>
          <textarea
            id="notes" name="notes" rows="3"
            value={form.notes} onChange={handleChange}
            placeholder="Brief project summary..."
            required
          />
        </div>
        <div className="form-actions" style={{ display: 'flex', gap: '8px' }}>
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : (project.name ? 'Save Changes' : 'Create Project')} &rarr;
          </button>
        </div>
      </form>
    </div>
  );
}
