// server/controllers/analyticsController.js
const Quest = require('../models/Quest');
const User = require('../models/User');

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const questsCompleted = await Quest.countDocuments({
      userId,
      status: 'completed',
    });

    const streak = await Quest.aggregate([
      { $match: { userId, status: 'completed' } },
      { $group: { _id: null, dates: { $push: '$completedDates' } } },
      { $project: {
        maxStreak: {
          $reduce: {
            input: '$dates',
            initialValue: { current: 0, max: 0 },
            in: {
              current: {
                $cond: [
                  { $eq: [
                    { $subtract: [{ $arrayElemAt: ['$$this', 0] }, '$$value.currentDate'] },
                    86400000 // 1 day in milliseconds
                  ]},
                  { $add: ['$$value.current', 1] },
                  1
                ]
              },
              max: { $max: ['$$value.max', { $add: ['$$value.current', 1] }] },
              currentDate: { $arrayElemAt: ['$$this', 0] },
            }
          }
        }
      }
    }
    ]);

    const user = await User.findById(userId);

    const summary = {
      questsCompleted,
      currentStreak: streak.length ? streak[0].maxStreak.current : 0,
      longestStreak: streak.length ? streak[0].maxStreak.max : 0,
      totalXp: user.stats.totalXpEarned,
      skillPoints: user.currencies.skillPoints,
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};