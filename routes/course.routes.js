const express = require('express');
const router = express.Router();

// Placeholder - we'll build this later
router.get('/', (req, res) => {
  res.json({ message: 'Courses route working' });
});

module.exports = router;