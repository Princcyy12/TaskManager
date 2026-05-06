// In-memory database — replaces MongoDB
const { v4: uuidv4 } = require('uuid');

const db = {
  users: [],
  projects: [],
  tasks: []
};

const newId = () => uuidv4().replace(/-/g, '').slice(0, 24);


const clone = (obj) => JSON.parse(JSON.stringify(obj));

const Users = {
  create(data) {
    const user = { _id: newId(), avatar: '', ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    db.users.push(user);
    return clone(user);
  },
  findById(id) {
    return clone(db.users.find(u => u._id === id) || null);
  },
  findOne(query) {
    const user = db.users.find(u => {
      return Object.entries(query).every(([k, v]) => u[k] === v);
    });
    return user ? clone(user) : null;
  },
  
  findOneWithPassword(query) {
    const user = db.users.find(u => {
      return Object.entries(query).every(([k, v]) => u[k] === v);
    });
    return user ? clone(user) : null;
  }
};


const Projects = {
  create(data) {
    const project = {
      _id: newId(),
      name: data.name,
      description: data.description || '',
      members: data.members || [],
      createdBy: data.createdBy,
      status: data.status || 'Active',
      deadline: data.deadline || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const creatorIdx = project.members.findIndex(m => m.user === project.createdBy);
    if (creatorIdx === -1) {
      project.members.push({ user: project.createdBy, role: 'Admin' });
    } else {
      project.members[creatorIdx].role = 'Admin';
    }
    db.projects.push(project);
    return clone(project);
  },
  findById(id) {
    return clone(db.projects.find(p => p._id === id) || null);
  },
  findByMember(userId) {
    return clone(db.projects.filter(p => p.members.some(m => m.user === userId)));
  },
  save(updated) {
    updated.updatedAt = new Date().toISOString();
    const idx = db.projects.findIndex(p => p._id === updated._id);
    if (idx !== -1) db.projects[idx] = clone(updated);
    return clone(updated);
  },
  deleteById(id) {
    db.projects = db.projects.filter(p => p._id !== id);
  }
};


const Tasks = {
  create(data) {
    const task = {
      _id: newId(),
      title: data.title,
      description: data.description || '',
      project: data.project,
      assignedTo: data.assignedTo || null,
      createdBy: data.createdBy,
      status: data.status || 'Todo',
      priority: data.priority || 'Medium',
      dueDate: data.dueDate || null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.tasks.push(task);
    return clone(task);
  },
  findById(id) {
    return clone(db.tasks.find(t => t._id === id) || null);
  },
  findByProject(projectId) {
    return clone(db.tasks.filter(t => t.project === projectId));
  },
  findByAssignee(userId) {
    return clone(db.tasks.filter(t => t.assignedTo === userId));
  },
  findByProjects(projectIds) {
    return clone(db.tasks.filter(t => projectIds.includes(t.project)));
  },
  save(updated) {
    updated.updatedAt = new Date().toISOString();
    // Auto-set completedAt
    if (updated.status === 'Done' && !updated.completedAt) {
      updated.completedAt = new Date().toISOString();
    } else if (updated.status !== 'Done') {
      updated.completedAt = null;
    }
    const idx = db.tasks.findIndex(t => t._id === updated._id);
    if (idx !== -1) db.tasks[idx] = clone(updated);
    return clone(updated);
  },
  deleteById(id) {
    db.tasks = db.tasks.filter(t => t._id !== id);
  },
  deleteByProject(projectId) {
    db.tasks = db.tasks.filter(t => t.project !== projectId);
  }
};


const populateUser = (id) => {
  if (!id) return null;
  const u = db.users.find(u => u._id === id);
  return u ? { _id: u._id, name: u.name, email: u.email } : { _id: id };
};

const populateProject = (id) => {
  if (!id) return null;
  const p = db.projects.find(p => p._id === id);
  return p ? { _id: p._id, name: p.name } : { _id: id };
};

const populateProjectFull = (project) => {
  if (!project) return null;
  return {
    ...project,
    members: project.members.map(m => ({ ...m, user: populateUser(m.user) })),
    createdBy: populateUser(project.createdBy)
  };
};

const populateTaskFull = (task) => {
  if (!task) return null;
  const now = new Date();
  const isOverdue = task.dueDate && task.status !== 'Done' && new Date(task.dueDate) < now;
  return {
    ...task,
    assignedTo: populateUser(task.assignedTo),
    createdBy: populateUser(task.createdBy),
    isOverdue
  };
};

const populateTaskWithProject = (task) => {
  if (!task) return null;
  const now = new Date();
  const isOverdue = task.dueDate && task.status !== 'Done' && new Date(task.dueDate) < now;
  return {
    ...task,
    project: populateProject(task.project),
    assignedTo: populateUser(task.assignedTo),
    createdBy: populateUser(task.createdBy),
    isOverdue
  };
};

module.exports = { Users, Projects, Tasks, populateProjectFull, populateTaskFull, populateTaskWithProject };
