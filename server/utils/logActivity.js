import Activity from '../models/Activity.js';

export const logActivity = async ({ team, project, task, user, action, description, metadata = {} }) => {
  try {
    const activity = await Activity.create({
      team,
      project,
      task,
      user,
      action,
      description,
      metadata
    });
    return activity;
  } catch (error) {
    console.error('Failed to log activity:', error.message);
    return null;
  }
};

export default logActivity;
