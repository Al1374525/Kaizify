const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const auth = require('../middleware/auth');

router.get('/', auth, rewardController.getRewards);
router.post('/', auth, rewardController.createReward); // Admin only
router.post('/:id/purchase', auth, rewardController.purchaseReward);

module.exports = router;