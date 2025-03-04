// server/controllers/socialController.js
const Guild = require('../models/Guild');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// Get all guilds user is part of
exports.getGuilds = async (req, res) => {
  try {
    const guilds = await Guild.find({ members: req.user._id })
      .populate('members', 'displayName avatar');
    res.json(guilds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a guild
exports.createGuild = async (req, res) => {
  try {
    const { name, description } = req.body;
    const guild = new Guild({
      name,
      description,
      leader: req.user._id,
      members: [req.user._id],
    });

    const savedGuild = await guild.save();
    const user = await User.findById(req.user._id);
    user.guilds.push(savedGuild._id);
    await user.save();

    res.status(201).json(savedGuild);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Join a guild
exports.joinGuild = async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.id);
    if (!guild) return res.status(404).json({ message: 'Guild not found' });
    if (guild.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    guild.members.push(req.user._id);
    const user = await User.findById(req.user._id);
    user.guilds.push(guild._id);

    await Promise.all([guild.save(), user.save()]);
    await notificationService.sendNotification(user, {
      title: 'Joined Guild!',
      body: `You’ve joined ${guild.name}!`,
    });

    res.json(guild);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leave a guild
exports.leaveGuild = async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.id);
    if (!guild || !guild.members.includes(req.user._id)) {
      return res.status(404).json({ message: 'Guild or membership not found' });
    }

    guild.members = guild.members.filter(id => id.toString() !== req.user._id.toString());
    if (guild.leader.toString() === req.user._id.toString() && guild.members.length > 0) {
      guild.leader = guild.members[0]; // Transfer leadership
    }

    const user = await User.findById(req.user._id);
    user.guilds = user.guilds.filter(id => id.toString() !== guild._id.toString());

    await Promise.all([guild.save(), user.save()]);
    res.json({ message: 'Left guild successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};