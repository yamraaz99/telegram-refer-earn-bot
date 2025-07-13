require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const JsonDatabase = require('./models/JsonDatabase');

const app = express();
const db = new JsonDatabase();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve admin panel
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { username: username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({ 
                success: true, 
                token: token,
                message: 'Login successful' 
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Get dashboard stats
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const stats = await db.getUserStats();
        const users = await db.getAllUsers();
        
        const pendingWithdrawals = users.reduce((total, user) => {
            return total + user.withdrawalRequests
                .filter(req => req.status === 'pending')
                .reduce((sum, req) => sum + req.amount, 0);
        }, 0);

        res.json({
            success: true,
            data: {
                ...stats,
                pendingWithdrawalAmount: pendingWithdrawals
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching stats' 
        });
    }
});

// Get all users
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    try {
        const users = await db.getAllUsers();
        
        // Sort by creation date (newest first)
        users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Users fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching users' 
        });
    }
});

// Get user details
app.get('/api/admin/users/:telegramId', authenticateAdmin, async (req, res) => {
    try {
        const user = await db.findUserByTelegramId(req.params.telegramId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('User fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching user' 
        });
    }
});

// Update user balance
app.post('/api/admin/users/:telegramId/balance', authenticateAdmin, async (req, res) => {
    try {
        const { amount, action } = req.body; // action: 'add' or 'subtract'
        const user = await db.findUserByTelegramId(req.params.telegramId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        let newBalance = user.walletBalance;
        if (action === 'add') {
            newBalance += parseFloat(amount);
        } else if (action === 'subtract') {
            newBalance -= parseFloat(amount);
            newBalance = Math.max(0, newBalance); // Don't allow negative balance
        }

        await db.updateUser(req.params.telegramId, { walletBalance: newBalance });

        res.json({
            success: true,
            message: `Balance ${action}ed successfully`,
            newBalance: newBalance
        });
    } catch (error) {
        console.error('Balance update error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating balance' 
        });
    }
});

// Get withdrawal requests
app.get('/api/admin/withdrawals', authenticateAdmin, async (req, res) => {
    try {
        const users = await db.getAllUsers();
        const withdrawals = [];

        users.forEach(user => {
            user.withdrawalRequests.forEach((request, index) => {
                withdrawals.push({
                    id: `${user.telegramId}_${index}`,
                    telegramId: user.telegramId,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    requestIndex: index,
                    ...request
                });
            });
        });

        // Sort by request date (newest first)
        withdrawals.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

        res.json({
            success: true,
            data: withdrawals
        });
    } catch (error) {
        console.error('Withdrawals fetch error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching withdrawals' 
        });
    }
});

// Process withdrawal request
app.post('/api/admin/withdrawals/:telegramId/:requestIndex', authenticateAdmin, async (req, res) => {
    try {
        const { telegramId, requestIndex } = req.params;
        const { action, adminNote } = req.body; // action: 'approve' or 'decline'
        
        const user = await db.findUserByTelegramId(telegramId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const request = user.withdrawalRequests[parseInt(requestIndex)];
        if (!request) {
            return res.status(404).json({ 
                success: false, 
                message: 'Withdrawal request not found' 
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: 'Request already processed' 
            });
        }

        // Update request status
        request.status = action === 'approve' ? 'approved' : 'declined';
        request.processedDate = new Date();
        request.adminNote = adminNote || '';

        // If declined, add money back to wallet
        if (action === 'decline') {
            user.walletBalance += request.amount;
        }

        await db.updateUser(telegramId, {
            withdrawalRequests: user.withdrawalRequests,
            walletBalance: user.walletBalance
        });

        res.json({
            success: true,
            message: `Withdrawal request ${action}d successfully`
        });
    } catch (error) {
        console.error('Withdrawal process error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error processing withdrawal' 
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Admin panel server running on port ${PORT}`);
});

module.exports = app;

