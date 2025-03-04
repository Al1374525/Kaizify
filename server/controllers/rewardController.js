// server/controllers/rewardController.js
const Reward = require('../models/Reward');
const User = require('../models/User');

// Get all available rewards
exports.getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find();
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new reward (admin-only, assumes role-based access control)
exports.createReward = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { name, description, cost, type, customization } = req.body;
    const reward = new Reward({ name, description, cost, type, customization });
    const savedReward = await reward.save();
    res.status(201).json(savedReward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Purchase a reward
exports.purchaseReward = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.currencies.coins < reward.cost.coins || user.currencies.gems < reward.cost.gems) {
      return res.status(400).json({ message: 'Insufficient currency' });
    }

    user.currencies.coins -= reward.cost.coins || 0;
    user.currencies.gems -= reward.cost.gems || 0;
    user.inventory.push({ item: reward._id });

    if (reward.type === 'customization') {
      user.avatar.customization = { ...user.avatar.customization, ...reward.customization };
    }

    await user.save();
    res.json({ message: 'Reward purchased', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};