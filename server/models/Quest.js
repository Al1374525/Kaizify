const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['fitness', 'productivity', 'learning', 'creativity', 'wellness', 'other'],
    index: true
  },
  difficulty: { 
    type: String, 
    enum: ['trivial', 'easy', 'medium', 'hard', 'epic'],
    default: 'medium',
    required: true
  },
  type: { 
    type: String, 
    enum: ['daily', 'weekly', 'epic', 'side'],
    default: 'daily',
    required: true,
    index: true
  },
  recurrence: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'once'],
      default: 'once'
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    endDate: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'archived'],
    default: 'active',
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completionCriteria: {
    type: {
      type: String,
      enum: ['checkbox', 'counter', 'timer', 'location'],
      default: 'checkbox'
    },
    target: {
      type: Number,
      default: 1
    },
    current: {
      type: Number,
      default: 0
    },
    units: String
  },
  completedDates: [{
    type: Date,
    index: true
  }],
  streakCount: {
    type: Number,
    default: 0
  },
  rewards: {
    xp: {
      type: Number,
      default: function() {
        // Default XP based on difficulty
        const difficultyMultipliers = {
          trivial: 5,
          easy: 10,
          medium: 20,
          hard: 40,
          epic: 100
        };
        return difficultyMultipliers[this.difficulty] || 20;
      }
    },
    coins: {
      type: Number,
      default: function() {
        // Default coins based on difficulty
        const difficultyMultipliers = {
          trivial: 1,
          easy: 3,
          medium: 5,
          hard: 10,
          epic: 25
        };
        return difficultyMultipliers[this.difficulty] || 5;
      }
    },
    skillPoints: {
      type: Object,
      default: function() {
        // Default skill points based on category and difficulty
        const points = Math.max(1, Math.floor(this.rewards.xp / 10));
        return { [this.category]: points };
      }
    },
    items: [{
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reward'
      },
      chance: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
      }
    }]
  },
  tags: [{
    type: String,
    trim: true
  }],
  dueDate: {
    type: Date,
    index: true
  },
  reminderTime: Date,
  location: {
    name: String,
    latitude: Number,
    longitude: Number,
    radius: Number // in meters
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  guildId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guild',
    index: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
questSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate if quest is overdue
questSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return new Date() > this.dueDate && this.status === 'active';
});

// Calculate days remaining until due date
questSchema.virtual('daysRemaining').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const diff = this.dueDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Method to complete a quest
questSchema.methods.complete = async function() {
  this.status = 'completed';
  this.progress = 100;
  this.completedDates.push(new Date());
  
  // Handle recurring quests
  if (this.recurrence.frequency !== 'once') {
    // Calculate next due date based on recurrence
    let nextDueDate = new Date(this.dueDate);
    
    if (this.recurrence.frequency === 'daily') {
      nextDueDate.setDate(nextDueDate.getDate() + 1);
    } else if (this.recurrence.frequency === 'weekly') {
      nextDueDate.setDate(nextDueDate.getDate() + 7);
    } else if (this.recurrence.frequency === 'monthly') {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }
    
    // Check if we've reached the end date
    if (!this.recurrence.endDate || nextDueDate <= this.recurrence.endDate) {
      // Reset for next occurrence
      this.status = 'active';
      this.progress = 0;
      this.completionCriteria.current = 0;
      this.dueDate = nextDueDate;
      
      // Increment streak
      this.streakCount += 1;
    }
  }
  
  await this.save();
  return this;
};

// Create compound indices for faster queries
questSchema.index({ userId: 1, status: 1 });
questSchema.index({ userId: 1, dueDate: 1 });
questSchema.index({ userId: 1, type: 1, status: 1 });

const Quest = mongoose.model('Quest', questSchema);

module.exports = Quest;