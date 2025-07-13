# Deployment Guide - Telegram Refer & Earn Bot

## Quick Start

1. **Extract Files**: Upload and extract the project zip file to your hosting directory
2. **Install Dependencies**: Run `npm install` in the project directory
3. **Configure Environment**: Edit `.env` file with your bot token and settings
4. **Start Bot**: Run `npm start` to start the bot and admin panel

## cPanel Deployment (Recommended)

### Step 1: Upload Files
1. Login to your cPanel
2. Go to **File Manager**
3. Navigate to your domain's public_html directory (or subdirectory)
4. Upload the project zip file
5. Extract the zip file

### Step 2: Setup Node.js App
1. In cPanel, go to **Node.js Apps** (or **Node.js Selector**)
2. Click **Create Application**
3. Select Node.js version (14.x or higher)
4. Set Application Root to your project directory
5. Set Application URL (e.g., `/telegram-bot`)
6. Set Startup File to `index.js`
7. Click **Create**

### Step 3: Install Dependencies
1. In the Node.js app interface, click **Run NPM Install**
2. Or use Terminal: `cd /path/to/your/app && npm install`

### Step 4: Configure Environment
1. Edit the `.env` file with your settings:
```env
BOT_TOKEN=your_bot_token_here
CHANNEL_USERNAME=@your_channel_username
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
PORT=3000
```

### Step 5: Start Application
1. In Node.js Apps, click **Start App**
2. Your bot will be running at: `https://yourdomain.com/telegram-bot`
3. Admin panel: `https://yourdomain.com/telegram-bot/`

## VPS/Dedicated Server Deployment

### Prerequisites
- Ubuntu/CentOS server
- Node.js 14+ installed
- PM2 process manager (recommended)

### Installation Steps

```bash
# 1. Upload and extract files
cd /var/www/
unzip telegram-refer-earn-bot.zip
cd telegram-refer-earn-bot

# 2. Install dependencies
npm install

# 3. Configure environment
nano .env
# Edit with your settings

# 4. Install PM2 (if not installed)
npm install -g pm2

# 5. Start with PM2
pm2 start index.js --name telegram-bot

# 6. Save PM2 configuration
pm2 save
pm2 startup

# 7. Setup Nginx (optional)
# Configure reverse proxy to your app
```

## Environment Configuration

### Required Settings
```env
# Telegram Bot Token (from @BotFather)
BOT_TOKEN=7889715687:AAEYb8q035aLkTqskGkX8Tfhyts2ndtYkfY

# Channel to verify membership
CHANNEL_USERNAME=@amazing_Deals_Loots_Flipkart

# Admin credentials for panel access
ADMIN_USERNAME=kuldeepiit
ADMIN_PASSWORD=kuldeepiit653@

# Rewards configuration
REFERRAL_REWARD=5
CHANNEL_JOIN_REWARD=5
MIN_WITHDRAWAL=100

# Server port
PORT=3000

# Security
JWT_SECRET=change-this-to-a-random-secret-key
```

### Optional Settings
```env
# MongoDB (if you want to use MongoDB instead of JSON)
USE_MONGODB=false
MONGODB_URI=mongodb://localhost:27017/telegram-refer-bot

# Channel ID (auto-detected if not provided)
CHANNEL_ID=-1001234567890
```

## Bot Setup

### 1. Create Telegram Bot
1. Message [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Choose bot name and username
4. Copy the bot token to `.env`

### 2. Setup Channel
1. Create a Telegram channel
2. Add your bot as administrator
3. Get channel username (e.g., @your_channel)
4. Update `CHANNEL_USERNAME` in `.env`

### 3. Configure Bot Commands (Optional)
Send to @BotFather:
```
/setcommands
start - Start the bot and get referral link
```

## Admin Panel Access

After deployment, access the admin panel:
- **URL**: `https://yourdomain.com/your-app-path/`
- **Username**: From `.env` file
- **Password**: From `.env` file

### Admin Features
- View user statistics
- Manage user accounts
- Process withdrawal requests
- Monitor bot performance

## Troubleshooting

### Common Issues

**Bot not responding:**
- Check bot token in `.env`
- Verify bot is started with @BotFather
- Check server logs for errors

**Channel verification not working:**
- Ensure bot is admin in channel
- Check channel username format (@channel_name)
- Verify channel is public or bot has access

**Admin panel not loading:**
- Check if Node.js app is running
- Verify port configuration
- Check browser console for errors

**Database errors:**
- Ensure `data/` directory exists and is writable
- Check file permissions
- For MongoDB: verify connection string

### Log Files
Check application logs:
```bash
# PM2 logs
pm2 logs telegram-bot

# cPanel logs
# Check in Node.js Apps interface
```

## Security Recommendations

1. **Change Default Credentials**: Update admin username/password
2. **Secure JWT Secret**: Use a strong, random JWT secret
3. **HTTPS**: Always use HTTPS in production
4. **Regular Backups**: Backup user data regularly
5. **Monitor Logs**: Check for suspicious activity
6. **Update Dependencies**: Keep packages updated

## Performance Optimization

1. **Use PM2**: For process management and auto-restart
2. **Enable Clustering**: For high traffic
3. **Database Optimization**: Consider MongoDB for large user base
4. **CDN**: Use CDN for static assets
5. **Monitoring**: Setup monitoring and alerts

## Support

For technical support:
1. Check logs for error messages
2. Verify configuration settings
3. Test bot functionality step by step
4. Monitor server resources

---

**Bot URL**: http://t.me/Referandearnmoney_free_bot  
**Channel**: https://t.me/amazing_Deals_Loots_Flipkart

Happy earning! 💰

