const mongoose = require('mongoose');

const matchSetSchema = new mongoose.Schema({
    teamScore: {
        type: Number,
        required: true
    },
    opponentScore: {
        type: Number,
        required: true
    }
});

const matchSchema = new mongoose.Schema({
    userIdSelf: {
        type: String,
        required: true
    },
    teamNameSelf: {
        type: String,
        required: true
    },
    partnerId: {
        type: String,
        required: true
    },
    opponentTeamName: {
        type: String,
        required: true
    },
    opponentPlayer1Id: {
        type: String,
        required: true
    },
    opponentPlayer2Id: {
        type: String,
        required: true
    },
    sport: {
        type: String,
        required: true
    },
    format: {
        type: String,
        required: true,
        enum: ['Singles', 'Doubles']
    },
    matchSetsScore: [matchSetSchema],
    result: {
        type: String
    }
});

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
