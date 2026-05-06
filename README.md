# Team Task Manager

A full-stack team task management app (React frontend + Express backend).

## 🚀 Quick Start (No MongoDB needed!)

The backend now uses **in-memory storage** — no database setup required.

> ⚠️ Data resets when the server restarts. For persistent storage, you can add MongoDB back later.

### Backend

```bash
cd backend
npm install
node server.js
# Server runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

### Environment Variables (optional)

Copy `backend/.env.example` to `backend/.env`:

```
PORT=5000
JWT_SECRET=your_jwt_secret_here
```

## Features

- User registration & login (JWT auth)
- Create and manage projects
- Add team members to projects (Admin/Member roles)
- Create, assign, and track tasks
- Task statuses: Todo → In Progress → Review → Done
- Dashboard with stats
- My Tasks view

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/projects | List my projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get project |
| PUT | /api/projects/:id | Update project (Admin) |
| DELETE | /api/projects/:id | Delete project (Admin) |
| POST | /api/projects/:id/members | Add member (Admin) |
| DELETE | /api/projects/:id/members/:userId | Remove member (Admin) |
| GET | /api/projects/:id/tasks | Get project tasks |
| POST | /api/tasks | Create task |
| GET | /api/tasks/my | My assigned tasks |
| GET | /api/tasks/:id | Get task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task (Admin) |
| GET | /api/users/search?email= | Find user by email |
| GET | /api/users/dashboard | Dashboard stats |
