import express from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { protect, teamMember } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { logActivity } from '../utils/logActivity.js';

const router = express.Router({ mergeParams: true });

// Require authentication and team membership for all project routes
router.use(protect, teamMember);

// @route   POST /api/teams/:teamId/projects
// @desc    Create project linked to team, log activity
// @access  Private (team member)
router.post(
  '/',
  validate([
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Project name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('startDate')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    body('deadline')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Deadline must be a valid date'),
    body('status')
      .optional()
      .isIn(['active', 'completed', 'archived'])
      .withMessage('Status must be active, completed, or archived')
  ]),
  asyncHandler(async (req, res) => {
    const { name, description, startDate, deadline, status } = req.body;

    const project = await Project.create({
      name,
      description: description || '',
      team: req.team._id,
      startDate: startDate || null,
      deadline: deadline || null,
      status: status || 'active',
      createdBy: req.user._id
    });

    await logActivity({
      team: req.team._id,
      project: project._id,
      user: req.user._id,
      action: 'project_created',
      description: `${req.user.name} created project "${project.name}"`
    });

    const populatedProject = await Project.findById(project._id).populate(
      'createdBy',
      'name email'
    );

    res.status(201).json({
      success: true,
      data: populatedProject
    });
  })
);

// @route   GET /api/teams/:teamId/projects
// @desc    Get all projects for team
// @access  Private (team member)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const projects = await Project.find({ team: req.team._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: projects
    });
  })
);

// @route   GET /api/teams/:teamId/projects/:projectId
// @desc    Get single project (verify it belongs to team)
// @access  Private (team member)
router.get(
  '/:projectId',
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID format'
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      team: req.team._id
    }).populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  })
);

// @route   PUT /api/teams/:teamId/projects/:projectId
// @desc    Update project
// @access  Private (team member)
router.put(
  '/:projectId',
  validate([
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Project name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('startDate')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    body('deadline')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Deadline must be a valid date'),
    body('status')
      .optional()
      .isIn(['active', 'completed', 'archived'])
      .withMessage('Status must be active, completed, or archived')
  ]),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
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
        error: 'Project not found'
      });
    }

    const { name, description, startDate, deadline, status } = req.body;

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (startDate !== undefined) project.startDate = startDate;
    if (deadline !== undefined) project.deadline = deadline;
    if (status !== undefined) project.status = status;

    await project.save();

    const populatedProject = await Project.findById(project._id).populate(
      'createdBy',
      'name email'
    );

    res.status(200).json({
      success: true,
      data: populatedProject
    });
  })
);

// @route   DELETE /api/teams/:teamId/projects/:projectId
// @desc    Delete project and its tasks (owner only)
// @access  Private (team owner)
router.delete(
  '/:projectId',
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID format'
      });
    }

    const isOwner =
      req.team.owner.toString() === req.user.id ||
      req.team.members.some(
        (m) => m.user.toString() === req.user.id && m.role === 'owner'
      );

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: 'Only team owner can delete a project'
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      team: req.team._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Delete tasks belonging to this project
    await Task.deleteMany({ project: project._id });

    // Delete project
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project and associated tasks deleted successfully'
    });
  })
);

export default router;
