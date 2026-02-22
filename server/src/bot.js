import TelegramBot from "node-telegram-bot-api";
import Member from "./models/Member.js";
import Visit from "./models/Visit.js";
import Payment from "./models/Payment.js";

const statusEmoji = {
  active: "✅",
  expired: "⛔",
  inactive: "⏸️",
};

const statusLabel = {
  active: "Faol",
  expired: "Muddati tugagan",
  inactive: "Nofaol",
};

const subLabel = {
  daily: "Kunlik",
  monthly: "Oylik",
  yearly: "Yillik",
};

const payMethodLabel = {
  cash: "Naqd",
  card: "Karta",
  transfer: "O'tkazma",
  balance: "Balans",
};

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount) {
  return Number(amount || 0).toLocaleString("uz-UZ") + " so'm";
}

// A'zo ma'lumotlarini formatlash va yuborish
async function showMemberInfo(bot, chatId, memberId, extraText = "") {
  const member = await Member.findOne({ memberId });
  if (!member) {
    return bot.sendMessage(chatId, `❌ A'zo topilmadi: \`${memberId}\``, { parse_mode: "Markdown" });
  }

  const [visits, payments, totalVisits] = await Promise.all([
    Visit.find({ memberId: member._id }).sort({ checkInTime: -1 }).limit(5),
    Payment.find({ memberId: member._id }).sort({ createdAt: -1 }).limit(10),
    Visit.countDocuments({ memberId: member._id }),
  ]);

  const purchases = payments.filter((p) => p.category === "product");
  const subPayments = payments.filter((p) => p.category === "subscription");
  const totalSpent = payments
    .filter((p) => p.type === "income")
    .reduce((sum, p) => sum + p.amount, 0);

  const emoji = statusEmoji[member.status] || "❓";
  const status = statusLabel[member.status] || member.status;

  let subInfo = "📋 Obuna: Yo'q";
  if (member.subscription && member.subscription.type) {
    const sType = subLabel[member.subscription.type] || member.subscription.type;
    const sStatus = member.subscription.status === "active" ? "✅ Faol" : "⛔ Tugagan";

    // Qolgan kunlar
    const endDate = new Date(member.subscription.endDate);
    const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    const daysText = daysLeft > 0 ? ` (${daysLeft} kun qoldi)` : " (muddati o'tgan)";

    subInfo =
      `📋 *Obuna:* ${sType}\n` +
      `   ├ Holat: ${sStatus}\n` +
      `   ├ Boshlanish: ${formatDate(member.subscription.startDate)}\n` +
      `   ├ Tugash: ${formatDate(member.subscription.endDate)}${daysText}\n` +
      `   └ Narx: ${formatCurrency(member.subscription.price)}`;
  }

  let visitsInfo = "";
  if (visits.length > 0) {
    visitsInfo = "\n\n🚪 *Oxirgi tashriflar:*\n";
    visits.forEach((v, i) => {
      const prefix = i === visits.length - 1 ? "└" : "├";
      const dur = v.duration ? ` (${v.duration} daq)` : "";
      visitsInfo += `   ${prefix} ${formatDateTime(v.checkInTime)}${dur}\n`;
    });
  }

  let purchasesInfo = "";
  if (purchases.length > 0) {
    purchasesInfo = "\n🛒 *Xaridlar:*\n";
    purchases.slice(0, 5).forEach((p, i) => {
      const prefix = i === Math.min(purchases.length, 5) - 1 ? "└" : "├";
      purchasesInfo += `   ${prefix} ${p.description || "Mahsulot"} — ${formatCurrency(p.amount)}\n`;
    });
  }

  let subPayInfo = "";
  if (subPayments.length > 0) {
    subPayInfo = "\n💳 *Obuna to'lovlari:*\n";
    subPayments.slice(0, 5).forEach((p, i) => {
      const prefix = i === Math.min(subPayments.length, 5) - 1 ? "└" : "├";
      const method = payMethodLabel[p.paymentMethod] || p.paymentMethod;
      subPayInfo += `   ${prefix} ${formatDate(p.createdAt)} — ${formatCurrency(p.amount)} (${method})\n`;
    });
  }

  const balanceText = member.balance > 0
    ? `\n💰 Balans: *${formatCurrency(member.balance)}*`
    : "";

  const linkedText = member.telegramChatId === String(chatId)
    ? "\n🔔 Bildirishnomalar: *Yoqilgan*"
    : "";

  const message =
    `${emoji} *${member.fullName}*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🆔 ID: \`${member.memberId}\`\n` +
    `📞 Tel: ${member.phone || "—"}\n` +
    `📧 Email: ${member.email || "—"}\n` +
    `📅 Ro'yxatdan: ${formatDate(member.createdAt)}\n` +
    `🔘 Holat: ${status}${balanceText}${linkedText}\n\n` +
    `${subInfo}\n\n` +
    `📊 *Statistika:*\n` +
    `   ├ Jami tashriflar: ${totalVisits} ta\n` +
    `   ├ Jami sarflangan: ${formatCurrency(totalSpent)}\n` +
    `   └ Xaridlar: ${formatCurrency(purchases.reduce((s, p) => s + p.amount, 0))}` +
    `${visitsInfo}${purchasesInfo}${subPayInfo}` +
    extraText;

  return bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
}

// Muddati yaqinlashgan a'zolarga bildirishnoma
async function checkExpiryNotifications(bot) {
  try {
    const now = new Date();
    const members = await Member.find({
      status: "active",
      telegramChatId: { $nin: [null, ""] },
      "subscription.endDate": { $exists: true },
    });

    let sent = 0;
    for (const member of members) {
      const endDate = new Date(member.subscription.endDate);
      const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

      if (daysLeft === 3 || daysLeft === 1) {
        const dayText = daysLeft === 1 ? "*1 kun* qoldi! ⚡" : "*3 kun* qoldi";
        const msg =
          `⚠️ *Abonement muddati yaqinlashmoqda!*\n\n` +
          `👤 ${member.fullName}\n` +
          `📅 Tugash sanasi: ${formatDate(endDate)}\n` +
          `⏰ Qoldi: ${dayText}\n\n` +
          `Abonementni yangilash uchun sport zalga murojaat qiling.`;

        try {
          await bot.sendMessage(member.telegramChatId, msg, { parse_mode: "Markdown" });
          sent++;
        } catch (_) {
          // chatId eskirgan bo'lishi mumkin
        }
      }
    }

    if (sent > 0) {
      console.log(`[Bot cron] ${sent} ta a'zoga muddati yaqinlashgani haqida xabar yuborildi`);
    }
  } catch (err) {
    console.error("[Bot cron] Xatolik:", err.message);
  }
}

export function startTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log("TELEGRAM_BOT_TOKEN topilmadi, bot ishga tushmaydi");
    return;
  }

  const bot = new TelegramBot(token, { polling: true });
  console.log("Telegram bot ishga tushdi");

  // /start
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      `🏋️ *FitnessPro Bot*\n\n` +
      `A'zo ma'lumotlarini ko'rish uchun *8 raqamli maxsus ID* yuboring.\n\n` +
      `📌 ID ni a'zolik kartangizdan yoki admin orqali olishingiz mumkin.\n\n` +
      `_ID yuborganda Telegram hisobingiz avtomatik ulanadi va bildirishnomalar olasiz._\n\n` +
      `📋 Buyruqlar:\n` +
      `• /status — o'zingiz haqingizda ma'lumot\n` +
      `• /unlink — Telegramni uzish`,
      { parse_mode: "Markdown" }
    );
  });

  // /status — ulangan a'zo o'z ma'lumotini ko'rishi
  bot.onText(/\/status/, async (msg) => {
    const chatId = String(msg.chat.id);
    try {
      const member = await Member.findOne({ telegramChatId: chatId });
      if (!member) {
        return bot.sendMessage(
          msg.chat.id,
          "❌ Siz hali ulanmagansiz.\n\n8 raqamli ID yuboring — avtomatik ulanasiz.",
          { parse_mode: "Markdown" }
        );
      }
      await showMemberInfo(bot, msg.chat.id, member.memberId);
    } catch (err) {
      console.error("Bot /status xatolik:", err);
      bot.sendMessage(msg.chat.id, "⚠️ Xatolik yuz berdi.");
    }
  });

  // /unlink — Telegramni uzish
  bot.onText(/\/unlink/, async (msg) => {
    const chatId = String(msg.chat.id);
    try {
      const member = await Member.findOneAndUpdate(
        { telegramChatId: chatId },
        { telegramChatId: "" }
      );
      if (member) {
        bot.sendMessage(
          msg.chat.id,
          `✅ *${member.fullName}* — Telegram ulanishi uzildi.\n\nEndi bildirishnomalar kelmaydi.`,
          { parse_mode: "Markdown" }
        );
      } else {
        bot.sendMessage(msg.chat.id, "❌ Siz hali hech bir a'zoga ulanmagansiz.");
      }
    } catch (err) {
      console.error("Bot /unlink xatolik:", err);
      bot.sendMessage(msg.chat.id, "⚠️ Xatolik yuz berdi.");
    }
  });

  // /help
  bot.onText(/\/help/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      `📋 *Yordam*\n\n` +
        `• 8 raqamli ID yuboring — a'zo ma'lumotlari + Telegram ulanadi\n` +
        `• /status — o'zingiz haqingizda ma'lumot\n` +
        `• /unlink — Telegram ulanishini uzish\n` +
        `• /start — botni boshlash\n\n` +
        `ID ni a'zolar sahifasidagi "Maxsus ID" ustunidan olishingiz mumkin.`,
      { parse_mode: "Markdown" }
    );
  });

  // 8-raqamli ID → a'zoni topish + Telegramni ulash
  bot.on("message", async (msg) => {
    const text = (msg.text || "").trim();
    if (text.startsWith("/")) return;

    if (!/^\d{8}$/.test(text)) {
      if (/\d/.test(text)) {
        bot.sendMessage(
          msg.chat.id,
          "❌ ID 8 ta raqamdan iborat bo'lishi kerak.\n\nMasalan: `91778777`",
          { parse_mode: "Markdown" }
        );
      }
      return;
    }

    const chatId = String(msg.chat.id);

    try {
      const member = await Member.findOne({ memberId: text });
      if (!member) {
        bot.sendMessage(msg.chat.id, `❌ A'zo topilmadi: \`${text}\``, { parse_mode: "Markdown" });
        return;
      }

      // Eski ulanishni tozalash (boshqa a'zoda bo'lsa)
      await Member.updateMany(
        { telegramChatId: chatId, _id: { $ne: member._id } },
        { telegramChatId: "" }
      );

      const isNewLink = member.telegramChatId !== chatId;
      member.telegramChatId = chatId;
      await member.save();

      const extraText = isNewLink
        ? "\n\n✅ *Telegram ulandi!* Endi bildirishnomalar olasiz."
        : "";

      await showMemberInfo(bot, msg.chat.id, text, extraText);
    } catch (err) {
      console.error("Bot xatolik:", err);
      bot.sendMessage(msg.chat.id, "⚠️ Xatolik yuz berdi, qayta urinib ko'ring.");
    }
  });

  bot.on("polling_error", (err) => {
    console.error("Polling xatolik:", err.message);
  });

  // Muddati yaqinlashganlarga kunlik bildirishnoma (har 24 soatda)
  setInterval(() => checkExpiryNotifications(bot), 24 * 60 * 60 * 1000);
  // Startup da ham bir marta (10 soniya keyin)
  setTimeout(() => checkExpiryNotifications(bot), 10 * 1000);

  return bot;
}
