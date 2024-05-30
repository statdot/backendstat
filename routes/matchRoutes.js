const express = require('express');
const router = express.Router();
const { createMatch, getTeamName, getOpponentTeamName } = require('../controllers/matchController');

// Create a new match
router.post('/createMatch', createMatch);

// Fetch team name based on user ID
router.get('/getTeamName/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const teamName = await getTeamName(userId);
    if (teamName) {
      res.status(200).json({ teamName });
    } else {
      res.status(404).json({ message: 'Team name not found for the user ID' });
    }
  } catch (error) {
    console.error('Error fetching team name:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch opponent team name based on user ID
router.get('/getOpponentTeamName/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const opponentTeamName = await getOpponentTeamName(userId);
    if (opponentTeamName) {
      res.status(200).json({ opponentTeamName });
    } else {
      res.status(404).json({ message: 'Opponent team name not found for the user ID' });
    }
  } catch (error) {
    console.error('Error fetching opponent team name:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
