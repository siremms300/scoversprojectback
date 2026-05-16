// server/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  refreshToken,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);

module.exports = router;