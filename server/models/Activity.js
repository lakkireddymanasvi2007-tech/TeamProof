import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Team reference is required']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'task_created',
      'task_updated',
      'task_completed',
      'task_status_changed',
      'evidence_added',
      'blocker_added',
      'blocker_resolved',
      'project_created',
      'member_joined',
      'team_created'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

activitySchema.index({ team: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
