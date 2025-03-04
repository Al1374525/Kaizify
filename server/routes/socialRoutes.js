const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const auth = require('../middleware/auth');

router.get('/', auth, socialController.getGuilds);
router.post('/', auth, socialController.createGuild);
router.post('/:id/join', auth, socialController.joinGuild);
router.post('/:id/leave', auth, socialController.leaveGuild);

module.exports = router;