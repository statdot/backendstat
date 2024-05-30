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

// Function to fetch team name based on user ID
async function getTeamName(userId) {
    try {
        const match = await Match.findOne({ $or: [{ userIdSelf: userId }, { partnerId: userId }] });
        if (match) {
            if (match.userIdSelf === userId) {
                return match.teamNameSelf;
            } else {
                return match.partnerId;
            }
        }
        return null; // No match found
    } catch (error) {
        console.error('Error fetching team name:', error);
        throw error;
    }
}

// Function to fetch opponent team name based on user ID
async function getOpponentTeamName(userId) {
    try {
        const match = await Match.findOne({ $or: [{ opponentPlayer1Id: userId }, { opponentPlayer2Id: userId }] });
        if (match) {
            return match.opponentTeamName;
        }
        return null; // No match found
    } catch (error) {
        console.error('Error fetching opponent team name:', error);
        throw error;
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

        // Fetch team names based on user IDs if they have already played a match together
        const teamName = await getTeamName(userIdSelf);
        const partnerTeamName = await getTeamName(partnerId);
        const opponentTeam = await getOpponentTeamName(opponentPlayer1Id);

        const result = calculateMatchResult(matchSetsScore, teamName, opponentTeam);

        const newMatch = new Match({
            userIdSelf,
            teamNameSelf: teamName || teamNameSelf, // Use fetched team name if available, otherwise use provided name
            partnerId,
            teamNamePartner: partnerTeamName || teamNameSelf, // Use fetched team name if available, otherwise use provided name
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