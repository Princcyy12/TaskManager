const express = require('express');
const router = express.Router();
const { Users, Projects, Tasks } = require('../db');
const { protect } = require('../middleware/auth');

// @GET /api/users/search?email=...
router.get('/search', protect, (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email query required' });
    const user = Users.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No user found' });
    res.json({ _id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/users/dashboard
router.get('/dashboard', protect, (req, res) => {
  try {
    const projects = Projects.findByMember(req.user._id);
    const projectIds = projects.map(p => p._id);

    const allTasks = Tasks.findByProjects(projectIds);
    const myTasks = Tasks.findByAssignee(req.user._id);

    const now = new Date();
    const overdue = myTasks.filter(t => t.dueDate && t.status !== 'Done' && new Date(t.dueDate) < now);

    res.json({
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'Active').length,
      totalTasks: allTasks.length,
      myTasks: myTasks.length,
      completedTasks: myTasks.filter(t => t.status === 'Done').length,
      overdueTasks: overdue.length,
      tasksByStatus: {
        Todo: allTasks.filter(t => t.status === 'Todo').length,
        'In Progress': allTasks.filter(t => t.status === 'In Progress').length,
        Review: allTasks.filter(t => t.status === 'Review').length,
        Done: allTasks.filter(t => t.status === 'Done').length
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
