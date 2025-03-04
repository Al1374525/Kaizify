// server/controllers/userController.js
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// Get current user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password') // Exclude password
      .populate('friends', 'displayName avatar')
      .populate('guilds', 'name')
      .populate('achievements.achievement', 'title description icon');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { displayName, avatar, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (displayName) user.displayName = displayName;
    if (avatar) user.avatar = { ...user.avatar, ...avatar };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add friend (simplified; assumes friend request system elsewhere)
exports.addFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const user = await User.findById(req.user._id);
    const friend = await User.findById(friendId);

    if (!friend) return res.status(404).json({ message: 'Friend not found' });
    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    user.friends.push(friendId);
    friend.friends.push(req.user._id);
    await Promise.all([user.save(), friend.save()]);

    await notificationService.sendNotification(friend, {
      title: 'New Friend!',
      body: `${user.displayName} added you as a friend!`,
    });

    res.json({ message: 'Friend added', friends: user.friends });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Note: Registration/Login handled via Auth0 or separate auth endpoints