const Match = require('../models/Match'); 
const User = require('../models/User');

// Function to calculate match result based on the scores of matchSetsScore
function calculateMatchResult(matchSetsScore, teamName, opponentTeam) {
    let teamMatchSetsScoreWon = 0;
    let opponentMatchSetsScoreWon = 0;

    // Iterate through each set to calculate total matchSetsScore won by each team
    matchSetsScore.forEach(set => {
        const { teamScore, opponentScore } = set;
        if (teamScore > opponentScore) {
            teamMatchSetsScoreWon++;
        } else if (teamScore < opponentScore) {
            opponentMatchSetsScoreWon++;
        }
    });

    // Check if a team has won two matchSetsScore (Best of three matchSetsScore)
    if (teamMatchSetsScoreWon >= 2) {
        return `${teamName} won the match`;
    } else if (opponentMatchSetsScoreWon >= 2) {
        return `${opponentTeam} won the match`;
    } else {
        return 'Not decided';
    }
}

// Get Team Name based on User ID and Partner ID
exports.getTeamName = async (req, res) => {
    try {
        const { userId, partnerId } = req.query;
        
        const match = await Match.findOne({
            userIdSelf: userId,
            partnerId: partnerId
        });
        
        if (match) {
            res.status(200).json({ teamName: match.teamNameSelf });
        } else {
            res.status(404).json({ message: 'No team found for these players' });
        }
    } catch (error) {
        console.error('Error fetching team name:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Opponent Team Name based on Opponent Player IDs
exports.getOpponentTeamName = async (req, res) => {
    try {
        const { opponentPlayer1Id, opponentPlayer2Id } = req.query;

        // Find the team name where the opponent players have played together
        const match = await Match.findOne({
            opponentPlayer1Id: opponentPlayer1Id,
            opponentPlayer2Id: opponentPlayer2Id
        });

        if (match) {
            res.status(200).json({ opponentTeamName: match.opponentTeamName });
        } else {
            res.status(404).json({ message: 'No opponent team found for these players' });
        }
    } catch (error) {
        console.error('Error fetching opponent team name:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createMatch = async (req, res) => {
    try {
        const { userIdSelf, teamNameSelf, partnerId, opponentTeamName, opponentPlayer1Id, opponentPlayer2Id, sport, format, matchSetsScore } = req.body;

        // Validate required fields
        if (!userIdSelf || !teamNameSelf || !partnerId || !opponentTeamName || !opponentPlayer1Id || !opponentPlayer2Id || !sport || !format || !Array.isArray(matchSetsScore)) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        // Check if all IDs are distinct
        if (new Set([userIdSelf, partnerId, opponentPlayer1Id, opponentPlayer2Id]).size !== 4) {
            return res.status(400).json({ message: 'All IDs must be distinct' });
        }

        // Check if all IDs correspond to existing users
        const existingUsers = await User.find({ userId: { $in: [userIdSelf, partnerId, opponentPlayer1Id, opponentPlayer2Id] } });
        const existingUserIds = existingUsers.map(user => user.userId.toString());
        const invalidIds = [userIdSelf, partnerId, opponentPlayer1Id, opponentPlayer2Id].filter(userId => !existingUserIds.includes(userId));
        if (invalidIds.length > 0) {
            return res.status(400).json({ message: `Invalid user IDs: ${invalidIds.join(', ')}, please enter valid Id.` });
        }

        const result = calculateMatchResult(matchSetsScore, teamNameSelf, opponentTeamName);

        const newMatch = new Match({
            userIdSelf,
            teamNameSelf,
            partnerId,
            opponentTeamName,
            opponentPlayer1Id,
            opponentPlayer2Id,
            sport,
            format,
            matchSetsScore,
            result
        });

        await newMatch.save();

        res.status(201).json({ message: 'Match created successfully', match: newMatch });
    } catch (error) {
        console.error('Error creating match:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};