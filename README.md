# Telegram Refer & Earn Money Bot

A complete Telegram bot with referral system and admin panel for managing users and withdrawals.

## Features

✅ **Channel Subscription Verification** - Users must join specified channel to use bot  
✅ **Referral System** - Earn ₹5 for each successful referral  
✅ **Channel Join Reward** - ₹5 bonus for joining the channel  
✅ **Wallet Management** - Track earnings and balance  
✅ **UPI Withdrawal System** - Minimum ₹100 withdrawal  
✅ **Admin Panel** - Complete user and withdrawal management  
✅ **JSON Database** - Lightweight file-based storage (MongoDB optional)  

## Bot Commands & Features

### User Commands:
- `/start` - Start the bot and check channel membership
- `🔗 Get Referral Link` - Generate unique referral link
- `💰 Wallet` - View balance and withdrawal options
- `💳 Set UPI ID` - Set UPI ID for withdrawals
- `❓ How to Use Bot` - Instructions and help

### Admin Panel Features:
- Dashboard with statistics
- User management (view, edit balance)
- Withdrawal request management (approve/decline)
- Real-time data updates

## Setup Instructions

### 1. Prerequisites
- Node.js (v14 or higher)
- Telegram Bot Token
- Telegram Channel

### 2. Installation

```bash
# Clone or extract the project
cd telegram-refer-earn-bot

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your settings
```

### 3. Configuration

Edit `.env` file with your settings:

```env
# Telegram Bot Configuration
BOT_TOKEN=your_bot_token_here
CHANNEL_USERNAME=@your_channel_username
CHANNEL_ID=-1001234567890

# Admin Panel Configuration
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your-super-secret-jwt-key

# Bot Configuration
REFERRAL_REWARD=5
CHANNEL_JOIN_REWARD=5
MIN_WITHDRAWAL=100

# Server Configuration
PORT=3000
```

### 4. Getting Bot Token

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Copy the bot token to `.env` file

### 5. Setting Up Channel

1. Create a Telegram channel
2. Add your bot as administrator
3. Get channel username (e.g., @your_channel)
4. Update `CHANNEL_USERNAME` in `.env`

### 6. Running the Bot

```bash
# Start the bot and admin panel
npm start
```

The bot will start and the admin panel will be available at:
- **Admin Panel**: http://localhost:3000
- **Login**: Use credentials from `.env` file

## Admin Panel Access

1. Open http://localhost:3000 in your browser
2. Login with admin credentials from `.env`
3. Manage users, view statistics, process withdrawals

## File Structure

```
telegram-refer-earn-bot/
├── models/
│   ├── User.js              # MongoDB user model
│   └── JsonDatabase.js      # JSON file database
├── views/
│   ├── login.html           # Admin login page
│   └── admin.html           # Admin dashboard
├── data/
│   └── users.json           # User data storage
├── bot.js                   # Telegram bot logic
├── server.js                # Express server & API
├── index.js                 # Main application
├── .env                     # Environment configuration
├── package.json             # Dependencies
└── README.md               # This file
```

## Database Options

### JSON File Database (Default)
- Lightweight and simple
- No external dependencies
- Perfect for small to medium scale

### MongoDB (Optional)
- Set `USE_MONGODB=true` in `.env`
- Provide `MONGODB_URI` in `.env`
- Better for large scale applications

## Deployment

### Local Deployment
```bash
npm start
```

### Production Deployment
1. Set up a VPS/Server
2. Install Node.js and PM2
3. Clone the project
4. Configure `.env` file
5. Run with PM2:
```bash
pm2 start index.js --name telegram-bot
```

### cPanel Deployment
1. Upload project files to cPanel
2. Install dependencies via Terminal
3. Configure `.env` file
4. Set up Node.js app in cPanel
5. Point to `index.js` as startup file

## Security Notes

- Change default admin credentials
- Use strong JWT secret
- Keep bot token secure
- Regular backup of user data
- Monitor for suspicious activity

## Support

For issues and support:
1. Check bot logs for errors
2. Verify environment configuration
3. Ensure bot has proper channel permissions
4. Check network connectivity

## License

MIT License - Feel free to modify and distribute.

---

**Bot URL**: http://t.me/Referandearnmoney_free_bot  
**Channel**: https://t.me/amazing_Deals_Loots_Flipkart

