import { useState } from 'react';

export default function ProjectSetup({ project, onSave }) {
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
    onSave(form);
  };

  return (
    <div className="card card-narrow">
      <div className="card-header">
        <h2>Project Setup</h2>
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
          <label htmlFor="client">Client Name</label>
          <input
            id="client" name="client" type="text"
            value={form.client} onChange={handleChange}
            placeholder="e.g. John Smith"
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
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes" name="notes" rows="3"
            value={form.notes} onChange={handleChange}
            placeholder="Any additional project notes..."
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Continue to Shades &rarr;
          </button>
        </div>
      </form>
    </div>
  );
}
