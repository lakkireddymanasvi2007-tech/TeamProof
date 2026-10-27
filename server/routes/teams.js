import express from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import Team from '../models/Team.js';
import { protect, teamMember } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { logActivity } from '../utils/logActivity.js';

const router = express.Router();

// Apply protect middleware to all team routes
router.use(protect);

// @route   POST /api/teams
// @desc    Create a new team, auto-add creator as owner member, log activity
// @access  Private
router.post(
  '/',
  validate([
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Team name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
  ]),
  asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description: description || '',
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'owner',
          joinedAt: new Date()
        }
      ]
    });

    await logActivity({
      team: team._id,
      user: req.user._id,
      action: 'team_created',
      description: `${req.user.name} created team "${team.name}"`
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTeam
    });
  })
);

// @route   GET /api/teams
// @desc    Get all teams the current user is a member of
// @access  Private
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const teams = await Team.find({ 'members.user': req.user._id })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: teams
    });
  })
);

// @route   POST /api/teams/join
// @desc    Join team by inviteCode only (no teamId required)
// @access  Private
router.post(
  '/join',
  validate([
    body('inviteCode')
      .trim()
      .notEmpty()
      .withMessage('Invite code is required')
  ]),
  asyncHandler(async (req, res) => {
    const { inviteCode } = req.body;
    const code = (inviteCode || '').trim().toLowerCase();

    const team = await Team.findOne({ inviteCode: code });
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Invalid invite code. No team found with this code.'
      });
    }

    const isMember = team.members.some(
      (m) => m.user.toString() === req.user.id
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this team'
      });
    }

    team.members.push({
      user: req.user._id,
      role: 'member',
      joinedAt: new Date()
    });

    await team.save();

    await logActivity({
      team: team._id,
      user: req.user._id,
      action: 'member_joined',
      description: `${req.user.name} joined the team`
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.status(200).json({
      success: true,
      data: populatedTeam
    });
  })
);

// @route   POST /api/teams/:teamId/join
// @desc    Join team via inviteCode with teamId in URL
// @access  Private
router.post(
  '/:teamId/join',
  validate([
    body('inviteCode')
      .trim()
      .notEmpty()
      .withMessage('Invite code is required')
  ]),
  asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { inviteCode } = req.body;

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid team ID format'
      });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    if (team.inviteCode !== inviteCode.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid invite code'
      });
    }

    const isMember = team.members.some(
      (m) => m.user.toString() === req.user.id
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this team'
      });
    }

    team.members.push({
      user: req.user._id,
      role: 'member',
      joinedAt: new Date()
    });

    await team.save();

    await logActivity({
      team: team._id,
      user: req.user._id,
      action: 'member_joined',
      description: `${req.user.name} joined the team`
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.status(200).json({
      success: true,
      data: populatedTeam
    });
  })
);

// @route   GET /api/teams/:teamId
// @desc    Get team details (members populated with name/email), verify membership
// @access  Private (team member)
router.get(
  '/:teamId',
  teamMember,
  asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.teamId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.status(200).json({
      success: true,
      data: team
    });
  })
);

// @route   GET /api/teams/:teamId/members
// @desc    Get team members with roles
// @access  Private (team member)
router.get(
  '/:teamId/members',
  teamMember,
  asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.teamId).populate(
      'members.user',
      'name email'
    );

    res.status(200).json({
      success: true,
      data: team.members
    });
  })
);

export default router;
