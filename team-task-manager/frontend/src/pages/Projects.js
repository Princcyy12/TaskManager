import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import './Projects.css';

const statusColors = { Active: '#10b981', Completed: '#6366f1', 'On Hold': '#f59e0b' };

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', deadline: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetch = () => {
    axios.get('/api/projects')
      .then(res => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post('/api/projects', form);
      setProjects([res.data, ...projects]);
      setShowModal(false);
      setForm({ name: '', description: '', deadline: '' });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const getUserRole = (project) => {
    const m = project.members?.find(m => m.user._id === user?._id);
    return m?.role || 'Member';
  };

  if (loading) return <div style={{ paddingTop: 60 }}><div className="spinner" /></div>;

  return (
    <div className="projects-page fade-in">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-sub">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-create" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <button className="btn-create" onClick={() => setShowModal(true)}>Create Project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <Link key={project._id} to={`/projects/${project._id}`} className="project-card">
              <div className="pc-header">
                <div className="pc-dot" style={{ background: statusColors[project.status] || '#6366f1' }} />
                <span className="badge" style={{
                  background: `${statusColors[project.status]}22`,
                  color: statusColors[project.status]
                }}>{project.status}</span>
                <span className="badge badge-admin" style={{ marginLeft: 'auto' }}>{getUserRole(project)}</span>
              </div>
              <h3 className="pc-name">{project.name}</h3>
              {project.description && <p className="pc-desc">{project.description}</p>}
              <div className="pc-footer">
                <div className="pc-members">
                  {project.members?.slice(0, 4).map((m, i) => (
                    <div key={i} className="mini-avatar" title={m.user.name}>
                      {m.user.name?.[0]?.toUpperCase()}
                    </div>
                  ))}
                  {project.members?.length > 4 && (
                    <div className="mini-avatar mini-more">+{project.members.length - 4}</div>
                  )}
                </div>
                {project.deadline && (
                  <span className="pc-deadline">
                    📅 {new Date(project.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Create New Project" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="modal-form">
            <div className="form-group">
              <label>Project Name *</label>
              <input type="text" placeholder="e.g. Website Redesign" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} placeholder="What's this project about?" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <input type="date" value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
