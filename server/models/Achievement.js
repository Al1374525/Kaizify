const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'fitness', 'productivity', 'learning', 'creativity', 'wellness', 'social'],
    index: true
  },
  icon: {
    type: String,
    required: true
  },
  tier: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  requirement: {
    type: {
      type: String,
      required: true,
      enum: [
        'questsCompleted', 
        'streakReached', 
        'xpEarned', 
        'coinsEarned', 
        'skillLevelReached',
        'customEvent',
        'questTypeCompleted',
        'categoryCompleted',
        'friendsCount',
        'guildsJoined',
        'specificQuest'
      ]
    },
    threshold: {
      type: Number,
      required: true
    },
    category: String,
    questType: String,
    questId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest'
    }
  },
  rewards: {
    xp: {
      type: Number,
      default: 0
    },
    coins: {
      type: Number,
      default: 0
    },
    gems: {
      type: Number,
      default: 0
    },
    items: [{
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reward'
      }
    }]
  },
  isSecret: {
    type: Boolean,
    default: false
  },
  isFeature: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create indices for faster queries
achievementSchema.index({ category: 1 });
achievementSchema.index({ tier: 1 });
achievementSchema.index({ 'requirement.type': 1 });

// Static method to get achievements by requirement type
achievementSchema.statics.getByRequirementType = function(type) {
  return this.find({ 'requirement.type': type });
};

// Method to check if a user meets the achievement's requirements
achievementSchema.methods.checkRequirement = async function(user, stats = {}) {
  const req = this.requirement;
  let userValue;
  
  switch(req.type) {
    case 'questsCompleted':
      userValue = user.stats.questsCompleted;
      break;
    case 'streakReached':
      userValue = stats.streak || user.stats.longestStreak;
      break;
    case 'xpEarned':
      userValue = user.stats.totalXpEarned;
      break;
    case 'coinsEarned':
      userValue = user.stats.totalCoinsEarned;
      break;
    case 'skillLevelReached':
      userValue = user.currencies.skillPoints[req.category] || 0;
      break;
    case 'questTypeCompleted':
      userValue = stats.questTypeCompleted?.[req.questType] || 0;
      break;
    case 'categoryCompleted':
      userValue = stats.categoryCompleted?.[req.category] || 0;
      break;
    case 'friendsCount':
      userValue = user.friends.length;
      break;
    case 'guildsJoined':
      userValue = user.guilds.length;
      break;
    case 'specificQuest':
      userValue = user.achievements.some(a => 
        a.achievement.toString() === this._id.toString()
      ) ? 0 : 1; // If already achieved, return 0, else check for 1
      break;
    case 'customEvent':
      userValue = stats.customEvent?.[req.eventName] || 0;
      break;
    default:
      userValue = 0;
  }
  
  return userValue >= req.threshold;
};

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;