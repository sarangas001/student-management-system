const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate, registerSchema, loginSchema } = require('../middleware/validate');

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/isLoggedIn', authController.isLoggedIn);
module.exports = router;