// matchRoutes.js

const express = require('express');
const router = express.Router();
const { createMatch, getTeamName, getOpponentTeamName } = require('../controllers/matchController');

// Create a new match
router.post('/createMatch', createMatch);

// Get team name based on user IDs
router.get('/getTeamName', getTeamName);

// Get opponent team name based on opponent player IDs
router.get('/getOpponentTeamName', getOpponentTeamName);

module.exports = router;
