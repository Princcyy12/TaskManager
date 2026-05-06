import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const StatCard = ({ label, value, icon, color }) => (
  <div className="stat-card" style={{ borderTopColor: color }}>
    <div className="stat-icon" style={{ color }}>{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const statusColors = { Todo: '#94a3b8', 'In Progress': '#6366f1', Review: '#f59e0b', Done: '#10b981' };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/users/dashboard')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ paddingTop: 60 }}><div className="spinner" /></div>;

  const maxStatus = stats ? Math.max(...Object.values(stats.tasksByStatus)) : 1;

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
        <div>
          <h1>Good day, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-sub">Here's your workspace overview</p>
        </div>
        <Link to="/projects" className="btn-create">+ New Project</Link>
      </div>

      {stats && (
        <>
          <div className="stats-grid">
            <StatCard label="Total Projects" value={stats.totalProjects} icon="◈" color="#6366f1" />
            <StatCard label="Active Projects" value={stats.activeProjects} icon="⚡" color="#10b981" />
            <StatCard label="My Tasks" value={stats.myTasks} icon="✦" color="#f59e0b" />
            <StatCard label="Overdue" value={stats.overdueTasks} icon="⚠" color="#ef4444" />
          </div>

          <div className="dash-grid">
            <div className="card">
              <h3 className="section-title">Tasks by Status</h3>
              <div className="status-bars">
                {Object.entries(stats.tasksByStatus).map(([status, count]) => (
                  <div key={status} className="status-bar-row">
                    <span className="status-label">{status}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{
                        width: maxStatus > 0 ? `${(count / maxStatus) * 100}%` : '0%',
                        background: statusColors[status]
                      }} />
                    </div>
                    <span className="bar-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="section-title">Quick Links</h3>
              <div className="quick-links">
                <Link to="/projects" className="quick-link">
                  <span className="ql-icon">◈</span>
                  <div><div className="ql-title">View Projects</div><div className="ql-sub">Manage your projects</div></div>
                </Link>
                <Link to="/my-tasks" className="quick-link">
                  <span className="ql-icon">✦</span>
                  <div><div className="ql-title">My Tasks</div><div className="ql-sub">{stats.myTasks} tasks assigned</div></div>
                </Link>
                <div className="progress-summary">
                  <div className="ps-label">Overall Completion</div>
                  <div className="ps-bar-track">
                    <div className="ps-bar-fill" style={{
                      width: stats.myTasks > 0 ? `${Math.round((stats.completedTasks / stats.myTasks) * 100)}%` : '0%'
                    }} />
                  </div>
                  <div className="ps-pct">
                    {stats.myTasks > 0 ? Math.round((stats.completedTasks / stats.myTasks) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
