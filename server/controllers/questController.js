// server/controllers/questController.js
const Quest = require('../models/Quest');
const User = require('../models/User');
const achievementService = require('../services/achievementService');
const notificationService = require('../services/notificationService');

// Get all quests for the authenticated user
exports.getQuests = async (req, res) => {
  try {
    const quests = await Quest.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(quests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single quest by ID
exports.getQuestById = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest || quest.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    res.json(quest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new quest
exports.createQuest = async (req, res) => {
  try {
    const { title, description, category, difficulty, type, recurrence, dueDate } = req.body;
    const quest = new Quest({
      userId: req.user._id,
      title,
      description,
      category,
      difficulty,
      type,
      recurrence,
      dueDate,
    });

    const savedQuest = await quest.save();
    await notificationService.sendNotification(req.user, {
      title: 'New Quest Created!',
      body: `You've started "${title}". Good luck!`,
    });

    res.status(201).json(savedQuest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a quest
exports.updateQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest || quest.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    Object.assign(quest, req.body);
    const updatedQuest = await quest.save();
    res.json(updatedQuest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a quest
exports.deleteQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest || quest.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    await quest.remove();
    res.json({ message: 'Quest deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete a quest
exports.completeQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest || quest.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    const updatedQuest = await quest.complete();
    const user = await User.findById(req.user._id);
    const rewards = {
      xp: updatedQuest.rewards.xp,
      coins: updatedQuest.rewards.coins,
      skillPoints: updatedQuest.rewards.skillPoints,
    };

    await user.addXP(rewards.xp);
    await user.addCurrency('coins', rewards.coins);
    await user.addCurrency(`skillPoints.${quest.category}`, rewards.skillPoints[quest.category]);

    await achievementService.checkAchievements(user);
    await notificationService.sendNotification(user, {
      title: 'Quest Completed!',
      body: `You earned ${rewards.xp} XP and ${rewards.coins} coins!`,
    });

    res.json({ quest: updatedQuest, rewards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};