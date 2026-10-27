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

// Middleware to verify that the project belongs to the team
const verifyProjectBelongsToTeam = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid project ID format'
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

  req.project = project;
  next();
});

router.use(verifyProjectBelongsToTeam);

// @route   POST /api/teams/:teamId/projects/:projectId/tasks
// @desc    Create task, verify assignee is team member if provided, log activity
// @access  Private (team member)
router.post(
  '/',
  validate([
    body('title')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Task title must be between 2 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description cannot exceed 2000 characters'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Priority must be low, medium, high, or urgent'),
    body('status')
      .optional()
      .isIn(['todo', 'in-progress', 'blocked', 'done'])
      .withMessage('Status must be todo, in-progress, blocked, or done'),
    body('dueDate')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Due date must be a valid date'),
    body('assignee')
      .optional({ nullable: true, checkFalsy: true })
      .isMongoId()
      .withMessage('Assignee must be a valid user ID')
  ]),
  asyncHandler(async (req, res) => {
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      assignee,
      completionSummary
    } = req.body;

    if (assignee) {
      const isMember = req.team.members.some(
        (m) => m.user.toString() === assignee.toString()
      );
      if (!isMember) {
        return res.status(400).json({
          success: false,
          error: 'Assignee must be a member of the team'
        });
      }
    }

    const taskStatus = status || 'todo';
    const isDone = taskStatus === 'done';

    const task = await Task.create({
      title,
      description: description || '',
      project: req.project._id,
      assignee: assignee || null,
      priority: priority || 'medium',
      status: taskStatus,
      dueDate: dueDate || null,
      completionSummary: completionSummary || '',
      completedAt: isDone ? new Date() : null,
      completedBy: isDone ? req.user._id : null,
      createdBy: req.user._id
    });

    await logActivity({
      team: req.team._id,
      project: req.project._id,
      task: task._id,
      user: req.user._id,
      action: isDone ? 'task_completed' : 'task_created',
      description: isDone
        ? `${req.user.name} created and completed task "${task.title}"`
        : `${req.user.name} created task "${task.title}"`,
      metadata: { status: taskStatus }
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  })
);

// @route   GET /api/teams/:teamId/projects/:projectId/tasks
// @desc    Get all tasks for project, populate assignee
// @access  Private (team member)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const tasks = await Task.find({ project: req.project._id })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks
    });
  })
);

// @route   GET /api/teams/:teamId/projects/:projectId/tasks/:taskId
// @desc    Get single task with all details populated
// @access  Private (team member)
router.get(
  '/:taskId',
  asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format'
      });
    }

    const task = await Task.findOne({
      _id: taskId,
      project: req.project._id
    })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email')
      .populate('evidence.addedBy', 'name email')
      .populate('blockers.reportedBy', 'name email')
      .populate('blockers.resolvedBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  })
);

// @route   PUT /api/teams/:teamId/projects/:projectId/tasks/:taskId
// @desc    Update task fields (handles done transition & assignee validation)
// @access  Private (team member)
router.put(
  '/:taskId',
  validate([
    body('title')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Task title must be between 2 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description cannot exceed 2000 characters'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Priority must be low, medium, high, or urgent'),
    body('status')
      .optional()
      .isIn(['todo', 'in-progress', 'blocked', 'done'])
      .withMessage('Status must be todo, in-progress, blocked, or done'),
    body('dueDate')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Due date must be a valid date'),
    body('assignee')
      .optional({ nullable: true, checkFalsy: true })
      .isMongoId()
      .withMessage('Assignee must be a valid user ID')
  ]),
  asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format'
      });
    }

    const task = await Task.findOne({
      _id: taskId,
      project: req.project._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const {
      title,
      description,
      priority,
      status,
      dueDate,
      assignee,
      completionSummary
    } = req.body;

    if (assignee !== undefined) {
      if (assignee && assignee.trim() !== '') {
        const isMember = req.team.members.some(
          (m) => m.user.toString() === assignee.toString()
        );
        if (!isMember) {
          return res.status(400).json({
            success: false,
            error: 'Assignee must be a member of the team'
          });
        }
        task.assignee = assignee;
      } else {
        task.assignee = null;
      }
    }

    const oldStatus = task.status;
    let statusChanged = false;

    if (status !== undefined && status !== oldStatus) {
      statusChanged = true;
      task.status = status;

      if (status === 'done' && oldStatus !== 'done') {
        task.completedAt = new Date();
        task.completedBy = req.user._id;

        await logActivity({
          team: req.team._id,
          project: req.project._id,
          task: task._id,
          user: req.user._id,
          action: 'task_completed',
          description: `${req.user.name} completed task "${task.title}"`,
          metadata: { oldStatus, newStatus: status }
        });
      } else {
        if (oldStatus === 'done' && status !== 'done') {
          task.completedAt = null;
          task.completedBy = null;
        }

        await logActivity({
          team: req.team._id,
          project: req.project._id,
          task: task._id,
          user: req.user._id,
          action: 'task_status_changed',
          description: `${req.user.name} changed status of task "${task.title}" from "${oldStatus}" to "${status}"`,
          metadata: { oldStatus, newStatus: status }
        });
      }
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (completionSummary !== undefined) task.completionSummary = completionSummary;

    if (!statusChanged && (title !== undefined || description !== undefined || priority !== undefined || dueDate !== undefined)) {
      await logActivity({
        team: req.team._id,
        project: req.project._id,
        task: task._id,
        user: req.user._id,
        action: 'task_updated',
        description: `${req.user.name} updated task "${task.title}"`,
        metadata: { updatedFields: Object.keys(req.body) }
      });
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
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

// @route   DELETE /api/teams/:teamId/projects/:projectId/tasks/:taskId
// @desc    Delete task
// @access  Private (team member)
router.delete(
  '/:taskId',
  asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format'
      });
    }

    const task = await Task.findOne({
      _id: taskId,
      project: req.project._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  })
);

export default router;
