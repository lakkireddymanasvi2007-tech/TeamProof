import express from 'express';
import Team from '../models/Team.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import { protect, teamMember } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router({ mergeParams: true });

// Require authentication and team membership
router.use(protect, teamMember);

// @route   GET /api/teams/:teamId/dashboard
// @desc    Get dashboard metrics, member statistics, and team/project health
// @access  Private (team member)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const teamId = req.team._id;

    // Fetch team with populated member user details
    const team = await Team.findById(teamId).populate(
      'members.user',
      'name email'
    );

    // Fetch all projects for this team
    const projects = await Project.find({ team: teamId });
    const projectIds = projects.map((p) => p._id);

    // Fetch all tasks for these projects
    const tasks = await Task.find({ project: { $in: projectIds } });

    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const completionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now
    ).length;

    const openBlockers = tasks.filter(
      (t) => t.blockers && t.blockers.some((b) => !b.isResolved)
    ).length;

    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = tasks.filter(
      (t) =>
        t.status !== 'done' &&
        t.dueDate &&
        new Date(t.dueDate) >= now &&
        new Date(t.dueDate) <= next7Days
    ).length;

    // Last 20 activities for the team
    const recentActivity = await Activity.find({ team: teamId })
      .populate('user', 'name email')
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(20);

    // Member stats
    const memberStats = team.members.map((m) => {
      const user = m.user;
      const userIdStr = user?._id ? user._id.toString() : user?.toString();

      const memberTasks = tasks.filter(
        (t) => t.assignee && t.assignee.toString() === userIdStr
      );
      const assigned = memberTasks.length;
      const completed = memberTasks.filter((t) => t.status === 'done').length;
      const evidenceBacked = memberTasks.filter(
        (t) => t.status === 'done' && t.evidence && t.evidence.length > 0
      ).length;
      const overdue = memberTasks.filter(
        (t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now
      ).length;

      return {
        user: {
          _id: user?._id || userIdStr,
          name: user?.name || 'Unknown',
          email: user?.email || ''
        },
        assigned,
        completed,
        evidenceBacked,
        overdue
      };
    });

    // Health logic:
    // critical if >30% tasks overdue OR >3 open blockers
    // at-risk if >15% overdue OR >1 blocker OR deadline within 3 days with <80% completion
    // healthy otherwise
    const overduePercentage =
      totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;
    const next3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const hasImminentDeadlineWithLowCompletion =
      projects.some(
        (p) =>
          p.deadline &&
          new Date(p.deadline) >= now &&
          new Date(p.deadline) <= next3Days
      ) && completionPercentage < 80;

    let healthStatus = 'healthy';
    const reasons = [];

    const isCriticalOverdue = overduePercentage > 30;
    const isCriticalBlockers = openBlockers > 3;

    if (isCriticalOverdue || isCriticalBlockers) {
      healthStatus = 'critical';
      if (isCriticalOverdue) {
        reasons.push(
          `${Math.round(overduePercentage)}% of tasks are overdue (>30%)`
        );
      }
      if (isCriticalBlockers) {
        reasons.push(`${openBlockers} open blockers (>3)`);
      }
    } else {
      const isAtRiskOverdue = overduePercentage > 15;
      const isAtRiskBlockers = openBlockers > 1;
      const isAtRiskDeadline = hasImminentDeadlineWithLowCompletion;

      if (isAtRiskOverdue || isAtRiskBlockers || isAtRiskDeadline) {
        healthStatus = 'at-risk';
        if (isAtRiskOverdue) {
          reasons.push(
            `${Math.round(overduePercentage)}% of tasks are overdue (>15%)`
          );
        }
        if (isAtRiskBlockers) {
          reasons.push(`${openBlockers} open blockers (>1)`);
        }
        if (isAtRiskDeadline) {
          reasons.push(
            `Project deadline is within 3 days while task completion is only ${completionPercentage}% (<80%)`
          );
        }
      }
    }

    if (reasons.length === 0) {
      reasons.push('All projects and tasks are healthy and progressing as expected');
    }

    res.status(200).json({
      success: true,
      data: {
        team: {
          _id: team._id,
          name: team.name,
          description: team.description,
          inviteCode: team.inviteCode,
          owner: team.owner,
          members: team.members
        },
        totalProjects,
        totalTasks,
        completedTasks,
        completionPercentage,
        overdueTasks,
        openBlockers,
        upcomingDeadlines,
        recentActivity,
        memberStats,
        projectHealth: {
          status: healthStatus,
          reasons
        }
      }
    });
  })
);

export default router;
