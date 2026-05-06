const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Projects, Tasks, Users, populateProjectFull } = require('../db');
const { protect } = require('../middleware/auth');

const isAdmin = (project, userId) =>
  project.members.some(m => m.user === userId || (m.user && m.user._id === userId) ? m.role === 'Admin' : false);

const isMember = (project, userId) =>
  project.members.some(m => (m.user === userId || (m.user && m.user._id === userId)));

const getRawUserId = (userField) => typeof userField === 'object' ? userField._id : userField;

const isAdminRaw = (project, userId) =>
  project.members.some(m => getRawUserId(m.user) === userId && m.role === 'Admin');

const isMemberRaw = (project, userId) =>
  project.members.some(m => getRawUserId(m.user) === userId);

// @GET /api/projects
router.get('/', protect, (req, res) => {
  try {
    const projects = Projects.findByMember(req.user._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(populateProjectFull);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/projects
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Project name required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const project = Projects.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(populateProjectFull(project));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/projects/:id
router.get('/:id', protect, (req, res) => {
  try {
    const project = Projects.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isMemberRaw(project, req.user._id)) return res.status(403).json({ message: 'Access denied' });
    res.json(populateProjectFull(project));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/projects/:id
router.put('/:id', protect, (req, res) => {
  try {
    const project = Projects.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isAdminRaw(project, req.user._id)) return res.status(403).json({ message: 'Admin access required' });

    const { name, description, status, deadline } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (deadline !== undefined) project.deadline = deadline;

    const saved = Projects.save(project);
    res.json(populateProjectFull(saved));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/projects/:id
router.delete('/:id', protect, (req, res) => {
  try {
    const project = Projects.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isAdminRaw(project, req.user._id)) return res.status(403).json({ message: 'Admin access required' });

    Tasks.deleteByProject(req.params.id);
    Projects.deleteById(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/projects/:id/members
router.post('/:id/members', protect, (req, res) => {
  try {
    const project = Projects.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isAdminRaw(project, req.user._id)) return res.status(403).json({ message: 'Admin access required' });

    const { email, role } = req.body;
    const userToAdd = Users.findOne({ email: email.toLowerCase() });
    if (!userToAdd) return res.status(404).json({ message: 'User not found with that email' });

    if (isMemberRaw(project, userToAdd._id)) {
      return res.status(400).json({ message: 'User already a member' });
    }

    project.members.push({ user: userToAdd._id, role: role || 'Member' });
    const saved = Projects.save(project);
    res.json(populateProjectFull(saved));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/projects/:id/members/:userId
router.delete('/:id/members/:userId', protect, (req, res) => {
  try {
    const project = Projects.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isAdminRaw(project, req.user._id)) return res.status(403).json({ message: 'Admin access required' });
    if (req.params.userId === project.createdBy) {
      return res.status(400).json({ message: 'Cannot remove project creator' });
    }

    project.members = project.members.filter(m => getRawUserId(m.user) !== req.params.userId);
    const saved = Projects.save(project);
    res.json(populateProjectFull(saved));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/projects/:id/tasks
router.get('/:id/tasks', protect, (req, res) => {
  try {
    const project = Projects.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isMemberRaw(project, req.user._id)) return res.status(403).json({ message: 'Access denied' });

    const { populateTaskFull } = require('../db');
    const tasks = Tasks.findByProject(req.params.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(populateTaskFull);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
