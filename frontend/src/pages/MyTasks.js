import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import './MyTasks.css';

const FILTERS = ['All', 'Todo', 'In Progress', 'Review', 'Done'];

export default function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    axios.get('/api/tasks/my')
      .then(res => setTasks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (updated) => setTasks(tasks.map(t => t._id === updated._id ? updated : t));

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);
  const overdue = tasks.filter(t => t.dueDate && t.status !== 'Done' && new Date() > new Date(t.dueDate));

  if (loading) return <div style={{ paddingTop: 60 }}><div className="spinner" /></div>;

  return (
    <div className="my-tasks fade-in">
      <div className="page-header">
        <div>
          <h1>My Tasks</h1>
          <p className="page-sub">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
            {overdue.length > 0 && <span className="overdue-warning"> · {overdue.length} overdue</span>}
          </p>
        </div>
      </div>

      <div className="filter-tabs">
        {FILTERS.map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f}
            <span className="tab-count">
              {f === 'All' ? tasks.length : tasks.filter(t => t.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✦</div>
          <h3>No tasks here</h3>
          <p>You have no {filter !== 'All' ? filter.toLowerCase() : ''} tasks assigned</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {filtered.map(task => (
            <div key={task._id}>
              {task.project?.name && (
                <div className="task-project-label">◈ {task.project.name}</div>
              )}
              <TaskCard task={task} isAdmin={false} currentUser={user}
                onUpdate={handleUpdate} onDelete={() => {}} members={[]} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
