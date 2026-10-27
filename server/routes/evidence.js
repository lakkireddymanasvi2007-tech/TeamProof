import express from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { protect, teamMember } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { logActivity } from '../utils/logActivity.js';

const router = express.Router({ mergeParams: true });

// Require authentication and team membership
router.use(protect, teamMember);

// Helper to validate HTTP/HTTPS URLs
const isValidUrl = (urlString) => {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

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

// @route   POST /api/teams/:teamId/projects/:projectId/tasks/:taskId/evidence
// @desc    Add evidence URL to task, log activity
// @access  Private (team member)
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { url, label } = req.body;

    if (!url || typeof url !== 'string' || !isValidUrl(url.trim())) {
      return res.status(400).json({
        success: false,
        error: 'A valid URL starting with http:// or https:// is required'
      });
    }

    const evidenceItem = {
      url: url.trim(),
      label: label && typeof label === 'string' ? label.trim() : '',
      addedBy: req.user._id,
      addedAt: new Date()
    };

    req.task.evidence.push(evidenceItem);
    await req.task.save();

    await logActivity({
      team: req.team._id,
      project: req.project._id,
      task: req.task._id,
      user: req.user._id,
      action: 'evidence_added',
      description: `${req.user.name} added evidence to task "${req.task.title}"`,
      metadata: { url: evidenceItem.url, label: evidenceItem.label }
    });

    const populatedTask = await Task.findById(req.task._id).populate(
      'evidence.addedBy',
      'name email'
    );

    res.status(201).json({
      success: true,
      data: populatedTask.evidence
    });
  })
);

// @route   DELETE /api/teams/:teamId/projects/:projectId/tasks/:taskId/evidence/:evidenceId
// @desc    Remove evidence from task
// @access  Private (team member)
router.delete(
  '/:evidenceId',
  asyncHandler(async (req, res) => {
    const { evidenceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(evidenceId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid evidence ID format'
      });
    }

    const evidenceItem = req.task.evidence.id(evidenceId);
    if (!evidenceItem) {
      return res.status(404).json({
        success: false,
        error: 'Evidence not found'
      });
    }

    req.task.evidence.pull(evidenceId);
    await req.task.save();

    res.status(200).json({
      success: true,
      message: 'Evidence removed successfully',
      data: req.task.evidence
    });
  })
);

export default router;
