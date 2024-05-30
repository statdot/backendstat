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

        // Calculate match result based on the scorecard/scoring rules
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