import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import TaskCard from '../components/TaskCard';
import './ProjectDetail.css';

const STATUSES = ['Todo', 'In Progress', 'Review', 'Done'];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks');

  // Task modal
  const [taskModal, setTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: '' });
  const [submitting, setSubmitting] = useState(false);

  // Member modal
  const [memberModal, setMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Member');

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  const fetchProject = useCallback(async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        axios.get(`/api/projects/${id}`),
        axios.get(`/api/projects/${id}/tasks`)
      ]);
      setProject(pRes.data);
      setTasks(tRes.data);
      setEditForm({ name: pRes.data.name, description: pRes.data.description || '', status: pRes.data.status, deadline: pRes.data.deadline ? pRes.data.deadline.split('T')[0] : '' });
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const isAdmin = project?.members?.some(m => m.user._id === user?._id && m.role === 'Admin');

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...taskForm, project: id };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      const res = await axios.post('/api/tasks', payload);
      setTasks([res.data, ...tasks]);
      setTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: '' });
      toast.success('Task created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/projects/${id}/members`, { email: memberEmail, role: memberRole });
      setProject(res.data);
      setMemberModal(false);
      setMemberEmail('');
      toast.success('Member added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await axios.delete(`/api/projects/${id}/members/${userId}`);
      setProject(res.data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.put(`/api/projects/${id}`, editForm);
      setProject(res.data);
      setEditModal(false);
      toast.success('Project updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project? All tasks will be lost.')) return;
    try {
      await axios.delete(`/api/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleTaskUpdate = (updated) => {
    setTasks(tasks.map(t => t._id === updated._id ? updated : t));
  };

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div style={{ paddingTop: 60 }}><div className="spinner" /></div>;
  if (!project) return null;

  const statusColors = { Active: '#10b981', Completed: '#6366f1', 'On Hold': '#f59e0b' };
  const tasksByStatus = STATUSES.reduce((acc, s) => ({ ...acc, [s]: tasks.filter(t => t.status === s) }), {});

  return (
    <div className="project-detail fade-in">
      {/* Header */}
      <div className="pd-header">
        <button className="back-btn" onClick={() => navigate('/projects')}>← Back</button>
        <div className="pd-title-row">
          <div>
            <h1>{project.name}</h1>
            {project.description && <p className="pd-desc">{project.description}</p>}
          </div>
          <div className="pd-actions">
            <span className="badge" style={{ background: `${statusColors[project.status]}22`, color: statusColors[project.status] }}>{project.status}</span>
            {isAdmin && (
              <>
                <button className="icon-btn" onClick={() => setEditModal(true)} title="Edit">✎</button>
                <button className="icon-btn danger" onClick={handleDeleteProject} title="Delete">🗑</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pd-tabs">
        <button className={`tab ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>
          Tasks <span className="tab-count">{tasks.length}</span>
        </button>
        <button className={`tab ${tab === 'board' ? 'active' : ''}`} onClick={() => setTab('board')}>Board</button>
        <button className={`tab ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>
          Members <span className="tab-count">{project.members?.length}</span>
        </button>
      </div>

      {/* Tasks list tab */}
      {tab === 'tasks' && (
        <div>
          <div className="tab-toolbar">
            <button className="btn-create" onClick={() => setTaskModal(true)}>+ Add Task</button>
          </div>
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <h3>No tasks yet</h3>
              <p>Add your first task to get started</p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.map(task => (
                <TaskCard key={task._id} task={task} isAdmin={isAdmin} currentUser={user}
                  onUpdate={handleTaskUpdate} onDelete={() => handleTaskDelete(task._id)}
                  members={project.members} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Board tab */}
      {tab === 'board' && (
        <div>
          <div className="tab-toolbar">
            <button className="btn-create" onClick={() => setTaskModal(true)}>+ Add Task</button>
          </div>
          <div className="board">
            {STATUSES.map(status => (
              <div key={status} className="board-col">
                <div className="board-col-header">
                  <span>{status}</span>
                  <span className="tab-count">{tasksByStatus[status].length}</span>
                </div>
                <div className="board-tasks">
                  {tasksByStatus[status].map(task => (
                    <TaskCard key={task._id} task={task} isAdmin={isAdmin} currentUser={user}
                      onUpdate={handleTaskUpdate} onDelete={() => handleTaskDelete(task._id)}
                      members={project.members} compact />
                  ))}
                  {tasksByStatus[status].length === 0 && (
                    <div className="board-empty">No tasks</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members tab */}
      {tab === 'members' && (
        <div>
          {isAdmin && (
            <div className="tab-toolbar">
              <button className="btn-create" onClick={() => setMemberModal(true)}>+ Add Member</button>
            </div>
          )}
          <div className="members-list">
            {project.members?.map(m => (
              <div key={m.user._id} className="member-row">
                <div className="avatar">{m.user.name?.[0]?.toUpperCase()}</div>
                <div className="member-info">
                  <div className="member-name">{m.user.name}</div>
                  <div className="member-email">{m.user.email}</div>
                </div>
                <span className={`badge badge-${m.role.toLowerCase()}`}>{m.role}</span>
                {isAdmin && m.user._id !== project.createdBy._id && m.user._id !== user?._id && (
                  <button className="icon-btn danger sm" onClick={() => handleRemoveMember(m.user._id)}>✕</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {taskModal && (
        <Modal title="Create Task" onClose={() => setTaskModal(false)}>
          <form onSubmit={handleCreateTask} className="modal-form">
            <div className="form-group">
              <label>Title *</label>
              <input type="text" placeholder="Task title" value={taskForm.title}
                onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} placeholder="Task description" value={taskForm.description}
                onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project.members?.map(m => (
                    <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setTaskModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Task'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Member Modal */}
      {memberModal && (
        <Modal title="Add Member" onClose={() => setMemberModal(false)} size="sm">
          <form onSubmit={handleAddMember} className="modal-form">
            <div className="form-group">
              <label>Member Email *</label>
              <input type="email" placeholder="member@example.com" value={memberEmail}
                onChange={e => setMemberEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={memberRole} onChange={e => setMemberRole(e.target.value)}>
                <option>Member</option>
                <option>Admin</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setMemberModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Adding...' : 'Add Member'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Project Modal */}
      {editModal && (
        <Modal title="Edit Project" onClose={() => setEditModal(false)}>
          <form onSubmit={handleUpdateProject} className="modal-form">
            <div className="form-group">
              <label>Name *</label>
              <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                  {['Active', 'Completed', 'On Hold'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" value={editForm.deadline} onChange={e => setEditForm({ ...editForm, deadline: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setEditModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
