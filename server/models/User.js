const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.auth0Id;
    },
    select: false
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    level: { 
      type: Number, 
      default: 1 
    },
    class: { 
      type: String, 
      default: 'Adventurer',
      enum: ['Adventurer', 'Warrior', 'Mage', 'Ranger', 'Healer']
    },
    customization: {
      hair: { type: String, default: 'default' },
      face: { type: String, default: 'default' },
      outfit: { type: String, default: 'default' },
      color: { type: String, default: '#7e57c2' }
    }
  },
  currencies: {
    xp: { 
      type: Number, 
      default: 0 
    },
    coins: { 
      type: Number, 
      default: 100 
    },
    gems: { 
      type: Number, 
      default: 5 
    },
    skillPoints: {
      fitness: { type: Number, default: 0 },
      productivity: { type: Number, default: 0 },
      learning: { type: Number, default: 0 },
      creativity: { type: Number, default: 0 },
      wellness: { type: Number, default: 0 }
    }
  },
  stats: {
    questsCompleted: { type: Number, default: 0 },
    dailyStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    tasksCreated: { type: Number, default: 0 },
    achievementsUnlocked: { type: Number, default: 0 },
    totalXpEarned: { type: Number, default: 0 },
    totalCoinsEarned: { type: Number, default: 0 }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      socialActivity: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: { 
        type: String, 
        enum: ['public', 'friends', 'private'],
        default: 'friends'
      },
      activitySharing: { type: Boolean, default: true },
      showOnLeaderboards: { type: Boolean, default: true }
    },
    theme: { 
      type: String, 
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'normal', 'hard'],
      default: 'normal'
    }
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  guilds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guild'
  }],
  achievements: [{
    achievement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  inventory: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward'
    },
    acquiredAt: {
      type: Date,
      default: Date.now
    },
    used: {
      type: Boolean,
      default: false
    }
  }],
  lastDailyReset: {
    type: Date,
    default: Date.now
  },
  lastWeeklyReset: {
    type: Date,
    default: Date.now
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: Date,
  fcmTokens: [String] // Firebase Cloud Messaging tokens for push notifications
});

// Create index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ auth0Id: 1 });
userSchema.index({ displayName: 'text' });

// Hash the password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  
  next();
});

// Method to check password validity
userSchema.methods.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Calculate XP needed for next level
userSchema.methods.xpForNextLevel = function() {
  return Math.floor(100 * Math.pow(1.5, this.avatar.level - 1));
};

// Method to add XP and handle level ups
userSchema.methods.addXP = async function(amount) {
  this.currencies.xp += amount;
  this.stats.totalXpEarned += amount;
  
  let levelsGained = 0;
  let xpForNextLevel = this.xpForNextLevel();
  
  // Process level ups
  while (this.currencies.xp >= xpForNextLevel) {
    this.currencies.xp -= xpForNextLevel;
    this.avatar.level += 1;
    levelsGained += 1;
    xpForNextLevel = this.xpForNextLevel();
  }
  
  await this.save();
  return { newLevel: this.avatar.level, levelsGained };
};

// Method to add currency
userSchema.methods.addCurrency = async function(type, amount) {
  if (type === 'coins') {
    this.currencies.coins += amount;
    this.stats.totalCoinsEarned += amount;
  } else if (type === 'gems') {
    this.currencies.gems += amount;
  } else if (type.startsWith('skillPoints.')) {
    const skillType = type.split('.')[1];
    this.currencies.skillPoints[skillType] += amount;
  }
  
  await this.save();
  return this.currencies;
};

const User = mongoose.model('User', userSchema);

module.exports = User;