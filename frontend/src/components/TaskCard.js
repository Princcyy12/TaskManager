import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from './Modal';
import './TaskCard.css';

const priorityClass = { Low: 'low', Medium: 'medium', High: 'high', Critical: 'critical' };
const statusClass = { Todo: 'todo', 'In Progress': 'inprogress', Review: 'review', Done: 'done' };
const STATUSES = ['Todo', 'In Progress', 'Review', 'Done'];

export default function TaskCard({ task, isAdmin, currentUser, onUpdate, onDelete, members, compact }) {
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title, description: task.description || '',
    status: task.status, priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    assignedTo: task.assignedTo?._id || ''
  });
  const [saving, setSaving] = useState(false);

  const isAssignee = task.assignedTo?._id === currentUser?._id;
  const canEdit = isAdmin || isAssignee;

  const handleStatusChange = async (e) => {
    try {
      const res = await axios.put(`/api/tasks/${task._id}`, { status: e.target.value });
      onUpdate(res.data);
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...editForm };
      if (!payload.assignedTo) payload.assignedTo = null;
      if (!payload.dueDate) delete payload.dueDate;
      const res = await axios.put(`/api/tasks/${task._id}`, payload);
      onUpdate(res.data);
      setEditModal(false);
      toast.success('Task updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const isOverdue = task.dueDate && task.status !== 'Done' && new Date() > new Date(task.dueDate);

  return (
    <>
      <div className={`task-card ${compact ? 'compact' : ''}`}>
        <div className="tc-top">
          <div className="tc-badges">
            <span className={`badge badge-${priorityClass[task.priority]}`}>{task.priority}</span>
            {isOverdue && <span className="badge badge-overdue">Overdue</span>}
          </div>
          {canEdit && (
            <div className="tc-actions">
              <button className="icon-btn sm" onClick={() => setEditModal(true)} title="Edit">✎</button>
              {isAdmin && <button className="icon-btn danger sm" onClick={onDelete} title="Delete">🗑</button>}
            </div>
          )}
        </div>

        <div className="tc-title">{task.title}</div>
        {!compact && task.description && <p className="tc-desc">{task.description}</p>}

        <div className="tc-meta">
          {task.assignedTo && (
            <div className="tc-assignee">
              <div className="mini-av">{task.assignedTo.name?.[0]?.toUpperCase()}</div>
              {!compact && <span>{task.assignedTo.name}</span>}
            </div>
          )}
          {task.dueDate && (
            <span className={`tc-date ${isOverdue ? 'overdue' : ''}`}>
              📅 {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="tc-status-row">
          <select className={`status-select status-${statusClass[task.status]}`}
            value={task.status} onChange={handleStatusChange} disabled={!canEdit}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {editModal && (
        <Modal title="Edit Task" onClose={() => setEditModal(false)}>
          <form onSubmit={handleSave} className="modal-form">
            <div className="form-group">
              <label>Title *</label>
              <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required disabled={!isAdmin} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} disabled={!isAdmin} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })} disabled={!isAdmin}>
                  {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            {isAdmin && (
              <div className="form-row">
                <div className="form-group">
                  <label>Assign To</label>
                  <select value={editForm.assignedTo} onChange={e => setEditForm({ ...editForm, assignedTo: e.target.value })}>
                    <option value="">Unassigned</option>
                    {members?.map(m => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={editForm.dueDate} onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })} />
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setEditModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
