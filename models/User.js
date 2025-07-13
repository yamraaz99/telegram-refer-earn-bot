const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        default: ''
    },
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    referralCode: {
        type: String,
        required: true,
        unique: true
    },
    referredBy: {
        type: String,
        default: null
    },
    referredUsers: [{
        type: String
    }],
    walletBalance: {
        type: Number,
        default: 0
    },
    upiId: {
        type: String,
        default: ''
    },
    hasJoinedChannel: {
        type: Boolean,
        default: false
    },
    channelJoinRewardClaimed: {
        type: Boolean,
        default: false
    },
    withdrawalRequests: [{
        amount: Number,
        upiId: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'declined'],
            default: 'pending'
        },
        requestDate: {
            type: Date,
            default: Date.now
        },
        processedDate: Date,
        adminNote: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);

