const express = require('express');
const router = express.Router();
const { createGoal, getGoals } = require('../controllers/goalsController');

router.post('/', createGoal);
router.get('/', getGoals);

module.exports = router;
