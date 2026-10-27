import express from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { protect, teamMember } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { logActivity } from '../utils/logActivity.js';

const router = express.Router({ mergeParams: true });

// Require authentication and team membership
router.use(protect, teamMember);

// Middleware to verify project and task hierarchy
const verifyTaskHierarchy = asyncHandler(async (req, res, next) => {
  const { projectId, taskId } = req.params;

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid project ID format'
    });
  }

  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid task ID format'
    });
  }

  const project = await Project.findOne({
    _id: projectId,
    team: req.team._id
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found for this team'
    });
  }

  const task = await Task.findOne({
    _id: taskId,
    project: project._id
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found for this project'
    });
  }

  req.project = project;
  req.task = task;
  next();
});

router.use(verifyTaskHierarchy);

// @route   POST /api/teams/:teamId/projects/:projectId/tasks/:taskId/blockers
// @desc    Add blocker with description, set task status to 'blocked', log activity
// @access  Private (team member)
router.post(
  '/',
  validate([
    body('description')
      .trim()
      .isLength({ min: 2, max: 1000 })
      .withMessage('Blocker description must be between 2 and 1000 characters')
  ]),
  asyncHandler(async (req, res) => {
    const { description } = req.body;

    const newBlocker = {
      description: description.trim(),
      reportedBy: req.user._id,
      reportedAt: new Date(),
      isResolved: false
    };

    req.task.blockers.push(newBlocker);
    req.task.status = 'blocked';
    req.task.completedAt = null;
    req.task.completedBy = null;

    await req.task.save();

    await logActivity({
      team: req.team._id,
      project: req.project._id,
      task: req.task._id,
      user: req.user._id,
      action: 'blocker_added',
      description: `${req.user.name} reported a blocker on task "${req.task.title}": ${description.trim()}`,
      metadata: { description: description.trim() }
    });

    const populatedTask = await Task.findById(req.task._id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email')
      .populate('evidence.addedBy', 'name email')
      .populate('blockers.reportedBy', 'name email')
      .populate('blockers.resolvedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  })
);

// @route   PUT /api/teams/:teamId/projects/:projectId/tasks/:taskId/blockers/:blockerId/resolve
// @desc    Resolve blocker, if no unresolved blockers reset status to 'todo', log activity
// @access  Private (team member)
router.put(
  '/:blockerId/resolve',
  asyncHandler(async (req, res) => {
    const { blockerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(blockerId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid blocker ID format'
      });
    }

    const blocker = req.task.blockers.id(blockerId);
    if (!blocker) {
      return res.status(404).json({
        success: false,
        error: 'Blocker not found'
      });
    }

    blocker.isResolved = true;
    blocker.resolvedAt = new Date();
    blocker.resolvedBy = req.user._id;

    const hasUnresolved = req.task.blockers.some((b) => !b.isResolved);
    if (!hasUnresolved && req.task.status === 'blocked') {
      req.task.status = 'todo';
    }

    await req.task.save();

    await logActivity({
      team: req.team._id,
      project: req.project._id,
      task: req.task._id,
      user: req.user._id,
      action: 'blocker_resolved',
      description: `${req.user.name} resolved a blocker on task "${req.task.title}"`,
      metadata: { blockerId }
    });

    const populatedTask = await Task.findById(req.task._id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email')
      .populate('evidence.addedBy', 'name email')
      .populate('blockers.reportedBy', 'name email')
      .populate('blockers.resolvedBy', 'name email');

    res.status(200).json({
      success: true,
      data: populatedTask
    });
  })
);

export default router;
