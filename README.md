# Project Management System

A full-stack project management application with role-based access control (Admin/Member).

## Features

- **Authentication**: JWT-based signup/login
- **Role-Based Access**: Admin and Member roles with different permissions
- **Project Management**: Create, view, update, delete projects
- **Task Management**: Create, assign, update status, track tasks
- **Dashboard**: Real-time statistics, overdue tasks tracking
- **Responsive Design**: Works on all devices

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: JWT, bcryptjs
- **Deployment**: Railway

## Installation

1. Clone the repository
2. Run `npm install`
3. Create `.env` file with your MongoDB URI
4. Run `npm start`

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Register
- POST `/api/auth/login` - Login

### Projects
- GET `/api/projects` - Get all projects
- POST `/api/projects` - Create project
- PUT `/api/projects/:id` - Update project (Admin)
- DELETE `/api/projects/:id` - Delete project (Admin)

### Tasks
- GET `/api/tasks` - Get all tasks
- POST `/api/tasks` - Create task
- PUT `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task (Admin)

### Dashboard
- GET `/api/dashboard` - Get statistics

## Deployment on Railway

1. Push code to GitHub
2. Create account on [Railway](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT`

## Demo Credentials

**Admin:**
- Email: admin@example.com (Create first)
- Password: your password

**Member:**
- Email: member@example.com (Create first)
- Password: your password

## License

MIT
