const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Tasks, Projects, populateTaskFull, populateTaskWithProject } = require('../db');
const { protect } = require('../middleware/auth');

const getRawUserId = (userField) => typeof userField === 'object' ? userField._id : userField;
const isMemberRaw = (project, userId) => project.members.some(m => getRawUserId(m.user) === userId);
const isAdminRaw = (project, userId) => project.members.some(m => getRawUserId(m.user) === userId && m.role === 'Admin');

// @POST /api/tasks
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Task title required'),
  body('project').notEmpty().withMessage('Project ID required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const project = Projects.findById(req.body.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isMemberRaw(project, req.user._id)) return res.status(403).json({ message: 'Access denied' });

    const task = Tasks.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(populateTaskFull(task));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/tasks/my
router.get('/my', protect, (req, res) => {
  try {
    const tasks = Tasks.findByAssignee(req.user._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(populateTaskWithProject);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/tasks/:id
router.get('/:id', protect, (req, res) => {
  try {
    const task = Tasks.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = Projects.findById(task.project);
    if (!project || !isMemberRaw(project, req.user._id)) return res.status(403).json({ message: 'Access denied' });

    res.json(populateTaskFull(task));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/tasks/:id
router.put('/:id', protect, (req, res) => {
  try {
    const task = Tasks.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = Projects.findById(task.project);
    if (!project || !isMemberRaw(project, req.user._id)) return res.status(403).json({ message: 'Access denied' });

    const userIsAdmin = isAdminRaw(project, req.user._id);
    const isAssignee = task.assignedTo && task.assignedTo === req.user._id;

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (userIsAdmin) {
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    } else if (isAssignee) {
      if (status) task.status = status;
    } else {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    if (status) task.status = status;
    const saved = Tasks.save(task);
    res.json(populateTaskFull(saved));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/tasks/:id
router.delete('/:id', protect, (req, res) => {
  try {
    const task = Tasks.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = Projects.findById(task.project);
    if (!project || !isAdminRaw(project, req.user._id)) return res.status(403).json({ message: 'Admin access required' });

    Tasks.deleteById(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
