const express = require('express');
const router = express.Router();
const aiAssistentController = require('../controllers/aiAssistentController');
const { protect } = require('../shared/authMiddleware');

// ── Protected AI Chat Routes ──────────────────────────────
router.post('/chat', protect, aiAssistentController.sendChatMessage);
router.get('/history', protect, aiAssistentController.getChatHistory);
router.post('/session', protect, aiAssistentController.startNewSession);
router.get('/context', protect, aiAssistentController.getAIContext);

// ── Legacy CRUD Routes (kept for compat) ──────────────────
router.get('/', protect, aiAssistentController.getAIAssistents);
router.get('/:id', protect, aiAssistentController.getAIAssistentById);
router.post('/', protect, aiAssistentController.createAIAssistent);
router.put('/:id', protect, aiAssistentController.updateAIAssistent);
router.delete('/:id', protect, aiAssistentController.deleteAIAssistent);

module.exports = router;
