// server/models/Reward.js
const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  cost: {
    coins: { type: Number, default: 0 },
    gems: { type: Number, default: 0 },
  },
  type: { type: String, enum: ['customization', 'item'], required: true },
  customization: { type: Object }, // For avatar customizations
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Reward', rewardSchema);