const fs = require('fs');
const path = require('path');

class JsonDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, '../data/users.json');
        this.ensureDataDirectory();
        this.loadData();
    }

    ensureDataDirectory() {
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    loadData() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const data = fs.readFileSync(this.dbPath, 'utf8');
                this.users = JSON.parse(data);
            } else {
                this.users = {};
                this.saveData();
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.users = {};
        }
    }

    saveData() {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(this.users, null, 2));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    async findUserByTelegramId(telegramId) {
        return this.users[telegramId] || null;
    }

    async findUserByReferralCode(referralCode) {
        return Object.values(this.users).find(user => user.referralCode === referralCode) || null;
    }

    async createUser(userData) {
        const telegramId = userData.telegramId;
        if (this.users[telegramId]) {
            throw new Error('User already exists');
        }
        
        const newUser = {
            telegramId,
            username: userData.username || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            referralCode: userData.referralCode,
            referredBy: userData.referredBy || null,
            referredUsers: [],
            walletBalance: 0,
            upiId: '',
            hasJoinedChannel: false,
            channelJoinRewardClaimed: false,
            withdrawalRequests: [],
            isActive: true,
            createdAt: new Date(),
            lastActive: new Date()
        };

        this.users[telegramId] = newUser;
        this.saveData();
        return newUser;
    }

    async updateUser(telegramId, updateData) {
        if (!this.users[telegramId]) {
            throw new Error('User not found');
        }
        
        this.users[telegramId] = { ...this.users[telegramId], ...updateData };
        this.users[telegramId].lastActive = new Date();
        this.saveData();
        return this.users[telegramId];
    }

    async getAllUsers() {
        return Object.values(this.users);
    }

    async getUserStats() {
        const users = Object.values(this.users);
        return {
            totalUsers: users.length,
            activeUsers: users.filter(user => user.isActive).length,
            totalReferrals: users.reduce((sum, user) => sum + user.referredUsers.length, 0),
            totalWalletBalance: users.reduce((sum, user) => sum + user.walletBalance, 0),
            pendingWithdrawals: users.reduce((sum, user) => 
                sum + user.withdrawalRequests.filter(req => req.status === 'pending').length, 0
            )
        };
    }

    generateReferralCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
}

module.exports = JsonDatabase;

