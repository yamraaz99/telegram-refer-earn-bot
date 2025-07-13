require('dotenv').config();

// Start the Telegram bot
const bot = require('./bot');

// Start the Express server
const server = require('./server');

console.log('🤖 Telegram Refer & Earn Bot is running!');
console.log('📊 Admin panel available at: http://localhost:' + (process.env.PORT || 3000));
console.log('🔑 Admin credentials:');
console.log('   Username:', process.env.ADMIN_USERNAME);
console.log('   Password:', process.env.ADMIN_PASSWORD);
console.log('');
console.log('Bot features:');
console.log('✅ Channel subscription verification');
console.log('✅ Referral system (₹' + process.env.REFERRAL_REWARD + ' per referral)');
console.log('✅ Channel join reward (₹' + process.env.CHANNEL_JOIN_REWARD + ')');
console.log('✅ Wallet management');
console.log('✅ UPI withdrawal system');
console.log('✅ Admin panel for user management');
console.log('');
console.log('🚀 Ready to accept users!');

