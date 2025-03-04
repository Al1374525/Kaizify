const express = require('express');
const router = express.Router();
const questController = require('../controllers/questController');
const auth = require('../middleware/auth');

router.get('/', auth, questController.getQuests);
router.get('/:id', auth, questController.getQuestById);
router.post('/', auth, questController.createQuest);
router.put('/:id', auth, questController.updateQuest);
router.delete('/:id', auth, questController.deleteQuest);
router.post('/:id/complete', auth, questController.completeQuest);

module.exports = router;