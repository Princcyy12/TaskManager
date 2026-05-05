// ========== DATA STORAGE ==========
let currentUser = null;
let currentTab = 'dashboard';

// Get data from localStorage
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

function getProjects() {
    const projects = localStorage.getItem('projects');
    return projects ? JSON.parse(projects) : [];
}

function getTasks() {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
}

// Save data to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function saveProjects(projects) {
    localStorage.setItem('projects', JSON.stringify(projects));
}

function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Initialize demo data if empty
function initData() {
    let users = getUsers();
    if (users.length === 0) {
        users = [
            {
                id: '1',
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'Admin',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                name: 'John Member',
                email: 'john@example.com',
                password: 'member123',
                role: 'Member',
                createdAt: new Date().toISOString()
            }
        ];
        saveUsers(users);
    }
    
    let projects = getProjects();
    if (projects.length === 0) {
        projects = [
            {
                id: '1',
                name: 'Website Redesign',
                description: 'Complete website redesign project with modern UI/UX',
                createdBy: '1',
                teamMembers: ['1', '2'],
                status: 'Active',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Mobile App Development',
                description: 'Build React Native mobile app for iOS and Android',
                createdBy: '1',
                teamMembers: ['1', '2'],
                status: 'Planning',
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Backend API',
                description: 'Develop RESTful API with Node.js',
                createdBy: '1',
                teamMembers: ['1'],
                status: 'On Hold',
                createdAt: new Date().toISOString()
            }
        ];
        saveProjects(projects);
    }
    
    let tasks = getTasks();
    if (tasks.length === 0) {
        tasks = [
            {
                id: '1',
                title: 'Design Homepage',
                description: 'Create modern homepage design with Figma',
                project: '1',
                assignedTo: '2',
                assignedBy: '1',
                status: 'In Progress',
                priority: 'High',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Setup Database',
                description: 'Design and setup MongoDB schema',
                project: '2',
                assignedTo: '2',
                assignedBy: '1',
                status: 'Todo',
                priority: 'Medium',
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                title: 'API Documentation',
                description: 'Write comprehensive API documentation',
                project: '3',
                assignedTo: '1',
                assignedBy: '1',
                status: 'Review',
                priority: 'Low',
                dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString()
            }
        ];
        saveTasks(tasks);
    }
}

// ========== AUTH FUNCTIONS ==========
function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        throw new Error('Invalid email or password');
    }
    
    currentUser = { ...user };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    renderMainApp();
}

function signup(name, email, password, role) {
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
        throw new Error('Email already exists');
    }
    
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role: role || 'Member',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    currentUser = { ...newUser };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    renderMainApp();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    renderAuth();
}

// ========== PROJECT FUNCTIONS ==========
function createProject(data) {
    const projects = getProjects();
    const newProject = {
        id: Date.now().toString(),
        ...data,
        createdBy: currentUser.id,
        teamMembers: [currentUser.id, ...(data.teamMembers || [])],
        createdAt: new Date().toISOString()
    };
    projects.push(newProject);
    saveProjects(projects);
    return newProject;
}

function deleteProject(projectId) {
    if (currentUser.role !== 'Admin') {
        throw new Error('Only admins can delete projects');
    }
    
    let projects = getProjects();
    projects = projects.filter(p => p.id !== projectId);
    saveProjects(projects);
    
    // Delete associated tasks
    let tasks = getTasks();
    tasks = tasks.filter(t => t.project !== projectId);
    saveTasks(tasks);
}

// ========== TASK FUNCTIONS ==========
function createTask(data) {
    const tasks = getTasks();
    const newTask = {
        id: Date.now().toString(),
        ...data,
        assignedBy: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
}

function updateTask(taskId, updates) {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updatedAt: new Date().toISOString() };
        saveTasks(tasks);
    }
}

function deleteTask(taskId) {
    if (currentUser.role !== 'Admin') {
        throw new Error('Only admins can delete tasks');
    }
    
    let tasks = getTasks();
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks(tasks);
}

// ========== RENDER FUNCTIONS ==========
function renderAuth() {
    const html = `
        <div class="auth-container">
            <div class="auth-card">
                <h2 id="auth-title">Login</h2>
                <div id="auth-error" class="alert alert-error"></div>
                <form id="auth-form">
                    <div class="form-group" id="name-group" style="display: none;">
                        <label>Full Name</label>
                        <input type="text" id="name" placeholder="Enter your name">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="email" placeholder="Enter your email" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="password" placeholder="Enter your password" required>
                    </div>
                    <div class="form-group" id="role-group" style="display: none;">
                        <label>Role</label>
                        <select id="role">
                            <option value="Member">Member</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" id="submit-btn">Login</button>
                </form>
                <div class="auth-link">
                    <a href="#" id="toggle-auth">Don't have an account? Sign up</a>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('app').innerHTML = html;
    
    let isLogin = true;
    
    const toggleLink = document.getElementById('toggle-auth');
    const authTitle = document.getElementById('auth-title');
    const nameGroup = document.getElementById('name-group');
    const roleGroup = document.getElementById('role-group');
    const submitBtn = document.getElementById('submit-btn');
    const errorDiv = document.getElementById('auth-error');
    
    toggleLink.onclick = (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        authTitle.textContent = isLogin ? 'Login' : 'Create Account';
        nameGroup.style.display = isLogin ? 'none' : 'block';
        roleGroup.style.display = isLogin ? 'none' : 'block';
        submitBtn.textContent = isLogin ? 'Login' : 'Sign Up';
        toggleLink.textContent = isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login';
        errorDiv.style.display = 'none';
    };
    
    document.getElementById('auth-form').onsubmit = (e) => {
        e.preventDefault();
        errorDiv.style.display = 'none';
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            if (isLogin) {
                login(email, password);
            } else {
                const name = document.getElementById('name').value;
                const role = document.getElementById('role').value;
                if (!name) throw new Error('Name is required');
                signup(name, email, password, role);
            }
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        }
    };
}

function renderMainApp() {
    initData();
    
    const projects = getProjects();
    const tasks = getTasks();
    const users = getUsers();
    
    // Filter data based on role
    let accessibleProjects = projects;
    let accessibleTasks = tasks;
    
    if (currentUser.role !== 'Admin') {
        accessibleProjects = projects.filter(p => 
            p.createdBy === currentUser.id || p.teamMembers.includes(currentUser.id)
        );
        accessibleTasks = tasks.filter(t => 
            t.assignedTo === currentUser.id || t.assignedBy === currentUser.id
        );
    }
    
    const html = `
        <div class="container">
            <div class="navbar">
                <div class="nav-brand">📊 ProjectHub</div>
                <div class="nav-user">
                    <span>👋 Hello, ${currentUser.name}</span>
                    <span class="role-badge role-${currentUser.role}">${currentUser.role}</span>
                    <button class="logout-btn" onclick="window.logout()">Logout</button>
                </div>
            </div>
            
            <div class="tabs">
                <button class="tab ${currentTab === 'dashboard' ? 'active' : ''}" onclick="window.switchTab('dashboard')">📈 Dashboard</button>
                <button class="tab ${currentTab === 'projects' ? 'active' : ''}" onclick="window.switchTab('projects')">📁 Projects</button>
                <button class="tab ${currentTab === 'tasks' ? 'active' : ''}" onclick="window.switchTab('tasks')">✅ Tasks</button>
                ${currentUser.role === 'Admin' ? `<button class="tab ${currentTab === 'users' ? 'active' : ''}" onclick="window.switchTab('users')">👥 Users</button>` : ''}
            </div>
            
            <div id="tab-content">
                ${currentTab === 'dashboard' ? renderDashboard(accessibleProjects, accessibleTasks) : ''}
                ${currentTab === 'projects' ? renderProjects(accessibleProjects, users) : ''}
                ${currentTab === 'tasks' ? renderTasks(accessibleTasks, projects, users) : ''}
                ${currentTab === 'users' && currentUser.role === 'Admin' ? renderUsers(users) : ''}
            </div>
        </div>
    `;
    
    document.getElementById('app').innerHTML = html;
}

function renderDashboard(projects, tasks) {
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const todoTasks = tasks.filter(t => t.status === 'Todo').length;
    const completionRate = totalTasks ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;
    
    const overdueTasks = tasks.filter(t => {
        return new Date(t.dueDate) < new Date() && t.status !== 'Done';
    });
    
    const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    
    return `
        <div class="dashboard-stats">
            <div class="stat-card">
                <h3>Total Projects</h3>
                <div class="stat-number">${totalProjects}</div>
            </div>
            <div class="stat-card">
                <h3>Tasks Progress</h3>
                <div class="stat-number">${completedTasks}/${totalTasks}</div>
                <small>${completionRate}% Complete</small>
            </div>
            <div class="stat-card">
                <h3>In Progress</h3>
                <div class="stat-number">${inProgressTasks}</div>
            </div>
            <div class="stat-card">
                <h3>To Do</h3>
                <div class="stat-number">${todoTasks}</div>
            </div>
        </div>
        
        <h2 class="section-header">⚠️ Overdue Tasks</h2>
        <div class="tasks-grid">
            ${overdueTasks.map(task => `
                <div class="task-card priority-${task.priority}">
                    <h4>${task.title}</h4>
                    <p>${task.description || 'No description'}</p>
                    <p><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
                    <span class="status-badge status-${task.status.replace(' ', '-')}">${task.status}</span>
                </div>
            `).join('') || '<p style="color: white;">No overdue tasks! 🎉</p>'}
        </div>
        
        <h2 class="section-header">📋 Recent Tasks</h2>
        <div class="tasks-grid">
            ${recentTasks.map(task => `
                <div class="task-card">
                    <h4>${task.title}</h4>
                    <p>${task.description || 'No description'}</p>
                    <span class="status-badge status-${task.status.replace(' ', '-')}">${task.status}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderProjects(projects, users) {
    return `
        <button class="btn-primary" onclick="window.showCreateProjectModal()">+ New Project</button>
        <div class="projects-grid">
            ${projects.map(project => {
                const createdBy = users.find(u => u.id === project.createdBy);
                return `
                    <div class="project-card">
                        <h3>${project.name}</h3>
                        <p>${project.description || 'No description'}</p>
                        <p><strong>Status:</strong> ${project.status}</p>
                        <p><strong>Team:</strong> ${project.teamMembers?.length || 1} members</p>
                        <small>Created by: ${createdBy?.name || 'Unknown'}</small>
                        <br><br>
                        <button onclick="window.viewProjectTasks('${project.id}')">View Tasks</button>
                        ${currentUser.role === 'Admin' ? `<button class="delete-btn" onclick="window.deleteProjectHandler('${project.id}')">Delete Project</button>` : ''}
                    </div>
                `;
            }).join('')}
        </div>
        
        <div id="project-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Create New Project</h3>
                    <span class="close" onclick="window.closeModal('project-modal')">&times;</span>
                </div>
                <form id="create-project-form">
                    <div class="form-group">
                        <label>Project Name *</label>
                        <input type="text" id="project-name" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="project-description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select id="project-status">
                            <option value="Planning">Planning</option>
                            <option value="Active">Active</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <button type="submit">Create Project</button>
                </form>
            </div>
        </div>
    `;
}

function renderTasks(tasks, projects, users) {
    return `
        <button class="btn-primary" onclick="window.showCreateTaskModal()">+ New Task</button>
        <div class="tasks-grid">
            ${tasks.map(task => {
                const project = projects.find(p => p.id === task.project);
                const assignedTo = users.find(u => u.id === task.assignedTo);
                return `
                    <div class="task-card priority-${task.priority}">
                        <h4>${task.title}</h4>
                        <p>${task.description || 'No description'}</p>
                        <p><strong>Project:</strong> ${project?.name || 'Unknown'}</p>
                        <p><strong>Assigned to:</strong> ${assignedTo?.name || 'Unassigned'}</p>
                        <p><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
                        <select class="status-select" onchange="window.updateTaskStatus('${task.id}', this.value)">
                            <option value="Todo" ${task.status === 'Todo' ? 'selected' : ''}>Todo</option>
                            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Review" ${task.status === 'Review' ? 'selected' : ''}>Review</option>
                            <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
                        </select>
                        <span class="status-badge status-${task.status.replace(' ', '-')}">${task.status}</span>
                        ${currentUser.role === 'Admin' ? `<button class="delete-btn" onclick="window.deleteTaskHandler('${task.id}')" style="margin-top: 10px;">Delete Task</button>` : ''}
                    </div>
                `;
            }).join('')}
        </div>
        
        <div id="task-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Create New Task</h3>
                    <span class="close" onclick="window.closeModal('task-modal')">&times;</span>
                </div>
                <form id="create-task-form">
                    <div class="form-group">
                        <label>Title *</label>
                        <input type="text" id="task-title" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="task-description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Project *</label>
                        <select id="task-project" required></select>
                    </div>
                    <div class="form-group">
                        <label>Assign To</label>
                        <select id="task-assigned"></select>
                    </div>
                    <div class="form-group">
                        <label>Priority</label>
                        <select id="task-priority">
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Due Date *</label>
                        <input type="date" id="task-due-date" required>
                    </div>
                    <button type="submit">Create Task</button>
                </form>
            </div>
        </div>
    `;
}

function renderUsers(users) {
    return `
        <h2 class="section-header">Team Members</h2>
        <div class="projects-grid">
            ${users.map(user => `
                <div class="project-card">
                    <h4>${user.name}</h4>
                    <p>Email: ${user.email}</p>
                    <p>Role: <span class="role-badge role-${user.role}">${user.role}</span></p>
                    <p>Member since: ${new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
            `).join('')}
        </div>
    `;
}

// ========== GLOBAL FUNCTIONS ==========
window.switchTab = (tab) => {
    currentTab = tab;
    renderMainApp();
};

window.showCreateProjectModal = () => {
    const modal = document.getElementById('project-modal');
    if (modal) modal.style.display = 'flex';
};

window.showCreateTaskModal = () => {
    const projects = getProjects();
    const users = getUsers();
    
    const projectSelect = document.getElementById('task-project');
    const assignedSelect = document.getElementById('task-assigned');
    
    if (projectSelect) {
        projectSelect.innerHTML = projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
    
    if (assignedSelect) {
        assignedSelect.innerHTML = '<option value="">Unassigned</option>' + 
            users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    }
    
    const modal = document.getElementById('task-modal');
    if (modal) modal.style.display = 'flex';
};

window.closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
};

window.viewProjectTasks = (projectId) => {
    currentTab = 'tasks';
    renderMainApp();
    alert('Switched to Tasks tab. You can view all tasks there.');
};

window.updateTaskStatus = (taskId, status) => {
    updateTask(taskId, { status });
    renderMainApp();
};

window.deleteProjectHandler = (projectId) => {
    if (confirm('Delete this project? All associated tasks will also be deleted.')) {
        try {
            deleteProject(projectId);
            renderMainApp();
        } catch (error) {
            alert(error.message);
        }
    }
};

window.deleteTaskHandler = (taskId) => {
    if (confirm('Delete this task?')) {
        try {
            deleteTask(taskId);
            renderMainApp();
        } catch (error) {
            alert(error.message);
        }
    }
};

window.logout = logout;

// Form submissions
document.addEventListener('submit', (e) => {
    if (e.target.id === 'create-project-form') {
        e.preventDefault();
        const name = document.getElementById('project-name').value;
        if (!name) {
            alert('Project name is required');
            return;
        }
        
        createProject({
            name: name,
            description: document.getElementById('project-description').value,
            status: document.getElementById('project-status').value
        });
        window.closeModal('project-modal');
        renderMainApp();
    }
    
    if (e.target.id === 'create-task-form') {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const project = document.getElementById('task-project').value;
        const dueDate = document.getElementById('task-due-date').value;
        
        if (!title || !project || !dueDate) {
            alert('Please fill all required fields');
            return;
        }
        
        createTask({
            title: title,
            description: document.getElementById('task-description').value,
            project: project,
            assignedTo: document.getElementById('task-assigned').value || null,
            priority: document.getElementById('task-priority').value,
            dueDate: new Date(dueDate).toISOString(),
            status: 'Todo'
        });
        window.closeModal('task-modal');
        renderMainApp();
    }
});

// Initialize
const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
    currentUser = JSON.parse(savedUser);
    renderMainApp();
} else {
    renderAuth();
}
