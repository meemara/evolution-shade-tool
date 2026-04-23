import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Login({ onLogin }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers().then(data => {
      setUsers(data);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load users:', err);
      setLoading(false);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    const user = users.find(u => u.id === Number(selectedUser));
    if (user) onLogin(user);
  };

  if (loading) {
    return (
      <div className="login-page">
        <div className="login-card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src="./evolution-logo.svg" alt="Evolution AV" className="login-logo-img" />
        </div>
        <div className="login-brand">
          <span className="login-company">Evolution</span>
          <span className="login-tagline">Audio &bull; Video &bull; Automation</span>
        </div>
        <h1 className="login-title">Shade Configuration Tool</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="user-select">Sign in as</label>
          <select
            id="user-select"
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
            autoFocus
          >
            <option value="">Select your name...</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary btn-save" disabled={!selectedUser}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
