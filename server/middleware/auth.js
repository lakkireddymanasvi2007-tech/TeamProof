import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Team from '../models/Team.js';

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, no token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized, user not found'
        });
      }

      req.user = {
        _id: user._id,
        id: user._id.toString(),
        name: user.name,
        email: user.email
      };

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token invalid or expired'
      });
    }
  } catch (error) {
    next(error);
  }
};

export const teamMember = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        error: 'Team ID is required'
      });
    }

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

    const isMember = team.members.some(
      (member) => member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You are not a member of this team'
      });
    }

    req.team = team;
    next();
  } catch (error) {
    next(error);
  }
};

export default { protect, teamMember };
