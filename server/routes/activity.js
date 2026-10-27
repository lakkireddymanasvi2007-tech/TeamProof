import express from 'express';
import Activity from '../models/Activity.js';
import { protect, teamMember } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router({ mergeParams: true });

// Require authentication and team membership
router.use(protect, teamMember);

// @route   GET /api/teams/:teamId/activity
// @desc    Get paginated activity feed for the team
// @access  Private (team member)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = { team: req.team._id };

    const total = await Activity.countDocuments(query);

    const activities = await Activity.find(query)
      .populate('user', 'name email')
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1
      }
    });
  })
);

export default router;
