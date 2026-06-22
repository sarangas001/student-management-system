const express = require('express');
const router = express.Router();
const aiAssistentController = require('../controllers/aiAssistentController');

router.get('/', aiAssistentController.getAIAssistents);
router.get('/chat-history', aiAssistentController.getChatHistory);
router.post('/chat', aiAssistentController.sendChatMessage);
router.get('/:id', aiAssistentController.getAIAssistentById);
router.post('/', aiAssistentController.createAIAssistent);
router.put('/:id', aiAssistentController.updateAIAssistent);
router.delete('/:id', aiAssistentController.deleteAIAssistent);

module.exports = router;
