require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

// Conditional database import
let db;
const USE_MONGODB = process.env.USE_MONGODB === "true";

if (USE_MONGODB) {
  const mongoose = require("mongoose");
  const User = require("./models/User");

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected successfully!"))
    .catch((err) => console.error("MongoDB connection error:", err));

  // Adapt Mongoose User model to match JsonDatabase interface for bot logic
  db = {
    findUserByTelegramId: async (telegramId) => User.findOne({ telegramId }),
    findUserByReferralCode: async (referralCode) =>
      User.findOne({ referralCode }),
    createUser: async (userData) => {
      const newUser = new User(userData);
      await newUser.save();
      return newUser;
    },
    updateUser: async (telegramId, updateData) => {
      const user = await User.findOneAndUpdate({ telegramId }, updateData, {
        new: true,
      });
      return user;
    },
    generateReferralCode: () => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    },
  };
} else {
  const JsonDatabase = require("./models/JsonDatabase");
  db = new JsonDatabase();
}

const token = process.env.BOT_TOKEN;
const channelUsername = process.env.CHANNEL_USERNAME;
const referralReward = parseInt(process.env.REFERRAL_REWARD);
const channelJoinReward = parseInt(process.env.CHANNEL_JOIN_REWARD);
const minWithdrawal = parseInt(process.env.MIN_WITHDRAWAL);

const bot = new TelegramBot(token, { polling: true });

// Bot commands and handlers
bot.onText(/\/start(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const referralCode = match[1] ? match[1].trim() : null;

  try {
    let user = await db.findUserByTelegramId(userId);

    if (!user) {
      // Create new user
      const newReferralCode = db.generateReferralCode();
      user = await db.createUser({
        telegramId: userId,
        username: msg.from.username || "",
        firstName: msg.from.first_name || "",
        lastName: msg.from.last_name || "",
        referralCode: newReferralCode,
        referredBy: referralCode,
      });

      // Process referral if valid
      if (referralCode && referralCode !== newReferralCode) {
        const referrer = await db.findUserByReferralCode(referralCode);
        if (referrer && referrer.telegramId !== userId) {
          // Add referral
          referrer.referredUsers.push(userId);
          referrer.walletBalance += referralReward;
          await db.updateUser(referrer.telegramId, {
            referredUsers: referrer.referredUsers,
            walletBalance: referrer.walletBalance,
          });

          // Notify referrer
          bot.sendMessage(
            referrer.telegramId,
            `🎉 Congratulations! You earned ₹${referralReward} for referring a new user!`
          );
        }
      }
    }

    // Check channel membership
    const isMember = await checkChannelMembership(userId);

    if (!isMember) {
      const keyboard = {
        inline_keyboard: [
          [
            { text: "📢 Join Channel", url: "https://t.me/amazing_Deals_Loots_Flipkart" },
          ],
          [{ text: "✅ I Joined", callback_data: "check_membership" }],
        ],
      };

      bot.sendMessage(
        chatId,
        `Welcome to Refer and Earn Money Bot! 💰\n\n` +
          `To use this bot, you must first join our channel:\n` +
          `${channelUsername}\n\n` +
          `After joining, click "I Joined" to verify.`,
        { reply_markup: keyboard }
      );
    } else {
      // User is already a member, give channel join reward if not claimed
      if (!user.channelJoinRewardClaimed) {
        user.walletBalance += channelJoinReward;
        user.channelJoinRewardClaimed = true;
        user.hasJoinedChannel = true;
        await db.updateUser(userId, {
          walletBalance: user.walletBalance,
          channelJoinRewardClaimed: true,
          hasJoinedChannel: true,
        });

        bot.sendMessage(
          chatId,
          `🎉 Welcome bonus! You received ₹${channelJoinReward} for joining our channel!`
        );
      }

      showMainMenu(chatId);
    }
  } catch (error) {
    console.error("Error in /start command:", error);
    bot.sendMessage(chatId, "Sorry, something went wrong. Please try again.");
  }
});

// Check channel membership
async function checkChannelMembership(userId) {
  try {
    const member = await bot.getChatMember(channelUsername, userId);
    return ["member", "administrator", "creator"].includes(member.status);
  } catch (error) {
    console.error("Error checking membership:", error);
    return false;
  }
}

// Show main menu
function showMainMenu(chatId) {
  const keyboard = {
    keyboard: [
      [{ text: "🔗 Get Referral Link" }, { text: "💰 Wallet" }],
      [{ text: "💳 Set UPI ID" }, { text: "❓ How to Use Bot" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };

  bot.sendMessage(
    chatId,
    `🏠 Main Menu\n\n` +
      `Choose an option below:`,
    { reply_markup: keyboard }
  );
}

// Handle callback queries
bot.on("callback_query", async (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;
  const userId = callbackQuery.from.id.toString();

  if (data === "check_membership") {
    const isMember = await checkChannelMembership(userId);

    if (isMember) {
      const user = await db.findUserByTelegramId(userId);
      if (user && !user.channelJoinRewardClaimed) {
        user.walletBalance += channelJoinReward;
        user.channelJoinRewardClaimed = true;
        user.hasJoinedChannel = true;
        await db.updateUser(userId, {
          walletBalance: user.walletBalance,
          channelJoinRewardClaimed: true,
          hasJoinedChannel: true,
        });

        bot.sendMessage(
          message.chat.id,
          `✅ Membership verified! You received ₹${channelJoinReward} welcome bonus!`
        );
      }

      showMainMenu(message.chat.id);
    } else {
      bot.answerCallbackQuery(callbackQuery.id, {
        text: "Please join the channel first!",
        show_alert: true,
      });
    }
  }
});

// Handle text messages
bot.on("message", async (msg) => {
  if (msg.text && !msg.text.startsWith("/")) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const text = msg.text;

    const user = await db.findUserByTelegramId(userId);
    if (!user || !user.hasJoinedChannel) {
      bot.sendMessage(chatId, "Please start the bot with /start command first.");
      return;
    }

    switch (text) {
      case "🔗 Get Referral Link":
        const referralLink = `https://t.me/Referandearnmoney_free_bot?start=${user.referralCode}`;
        bot.sendMessage(
          chatId,
          `🔗 Your Referral Link:\n\n` +
            `${referralLink}\n\n` +
            `💰 Earn ₹${referralReward} for each friend who joins using your link!\n\n` +
            `📊 Total Referrals: ${user.referredUsers.length}\n` +
            `💵 Total Earned: ₹${user.walletBalance}`
        );
        break;

      case "💰 Wallet":
        const keyboard = {
          inline_keyboard: [
            [{ text: "💸 Withdraw Money", callback_data: "withdraw_money" }],
          ],
        };

        bot.sendMessage(
          chatId,
          `💰 Your Wallet\n\n` +
            `💵 Balance: ₹${user.walletBalance}\n` +
            `👥 Total Referrals: ${user.referredUsers.length}\n` +
            `💳 UPI ID: ${user.upiId || "Not Set"}\n\n` +
            `Minimum withdrawal: ₹${minWithdrawal}`,
          { reply_markup: keyboard }
        );
        break;

      case "💳 Set UPI ID":
        bot.sendMessage(
          chatId,
          `💳 Please enter your UPI ID:\n\n` +
            `Example: yourname@paytm, yourname@phonepe, etc.\n\n` +
            `This will be used for withdrawals.`
        );

        // Set user state for UPI input
        user.awaitingUpiInput = true;
        await db.updateUser(userId, { awaitingUpiInput: true });
        break;

      case "❓ How to Use Bot":
        bot.sendMessage(
          chatId,
          `❓ How to Use This Bot\n\n` +
            `1️⃣ Get your referral link from the menu\n` +
            `2️⃣ Share it with friends and family\n` +
            `3️⃣ Earn ₹${referralReward} for each person who joins\n` +
            `4️⃣ Set your UPI ID for withdrawals\n` +
            `5️⃣ Withdraw when you reach ₹${minWithdrawal}\n\n` +
            `💡 Tips:\n` +
            `• Share in WhatsApp groups\n` +
            `• Post on social media\n` +
            `• Tell friends about earning opportunity\n\n` +
            `💰 You also got ₹${channelJoinReward} for joining our channel!`
        );
        break;

      default:
        // Check if user is setting UPI ID
        if (user.awaitingUpiInput) {
          const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
          if (upiPattern.test(text)) {
            await db.updateUser(userId, {
              upiId: text,
              awaitingUpiInput: false,
            });
            bot.sendMessage(chatId, `✅ UPI ID set successfully: ${text}`);
            showMainMenu(chatId);
          } else {
            bot.sendMessage(
              chatId,
              `❌ Invalid UPI ID format. Please enter a valid UPI ID like:\n` +
                `yourname@paytm, yourname@phonepe, etc.`
            );
          }
        } else {
          showMainMenu(chatId);
        }
        break;
    }
  }
});

// Handle withdrawal callback
bot.on("callback_query", async (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;
  const userId = callbackQuery.from.id.toString();

  if (data === "withdraw_money") {
    const user = await db.findUserByTelegramId(userId);

    if (!user.upiId) {
      bot.answerCallbackQuery(callbackQuery.id, {
        text: "Please set your UPI ID first!",
        show_alert: true,
      });
      return;
    }

    if (user.walletBalance < minWithdrawal) {
      bot.answerCallbackQuery(callbackQuery.id, {
        text: `Minimum withdrawal amount is ₹${minWithdrawal}`,
        show_alert: true,
      });
      return;
    }

    // Create withdrawal request
    const withdrawalRequest = {
      amount: user.walletBalance,
      upiId: user.upiId,
      status: "pending",
      requestDate: new Date(),
    };

    user.withdrawalRequests.push(withdrawalRequest);
    await db.updateUser(userId, { withdrawalRequests: user.withdrawalRequests });

    bot.sendMessage(
      message.chat.id,
      `✅ Withdrawal request submitted!\n\n` +
        `💰 Amount: ₹${user.walletBalance}\n` +
        `💳 UPI ID: ${user.upiId}\n` +
        `⏰ Status: Pending\n\n` +
        `Your request will be processed within 24-48 hours.`
    );
  }
});

console.log("Telegram bot started successfully!");

module.exports = bot;


