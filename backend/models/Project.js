const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' }
});

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  members: [MemberSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'On Hold'],
    default: 'Active'
  },
  deadline: { type: Date }
}, { timestamps: true });

// Ensure creator is always Admin
ProjectSchema.pre('save', function(next) {
  if (this.isNew) {
    const creatorIndex = this.members.findIndex(
      m => m.user.toString() === this.createdBy.toString()
    );
    if (creatorIndex === -1) {
      this.members.push({ user: this.createdBy, role: 'Admin' });
    } else {
      this.members[creatorIndex].role = 'Admin';
    }
  }
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);
