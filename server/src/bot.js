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

export function startTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log("TELEGRAM_BOT_TOKEN topilmadi, bot ishga tushmaydi");
    return;
  }

  const bot = new TelegramBot(token, { polling: true });
  console.log("Telegram bot ishga tushdi");

  // /start buyrug'i
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      `🏋️ *FitnessPro Bot*\n\nA'zo ma'lumotlarini ko'rish uchun 8 raqamli maxsus ID yuboring.\n\nMasalan: \`91778777\``,
      { parse_mode: "Markdown" }
    );
  });

  // /help buyrug'i
  bot.onText(/\/help/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      `📋 *Yordam*\n\n` +
        `• 8 raqamli ID yuboring — a'zo ma'lumotlari\n` +
        `• /start — botni boshlash\n` +
        `• /help — yordam\n\n` +
        `ID ni a'zolar sahifasidagi "Maxsus ID" ustunidan olishingiz mumkin.`,
      { parse_mode: "Markdown" }
    );
  });

  // 8-raqamli ID ni qabul qilish
  bot.on("message", async (msg) => {
    const text = (msg.text || "").trim();

    // Buyruqlarni o'tkazib yuborish
    if (text.startsWith("/")) return;

    // 8 ta raqam tekshirish
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

    try {
      const member = await Member.findOne({ memberId: text });
      if (!member) {
        bot.sendMessage(msg.chat.id, `❌ A'zo topilmadi: \`${text}\``, {
          parse_mode: "Markdown",
        });
        return;
      }

      // Ma'lumotlarni parallel yuklash
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

      // Status emoji
      const emoji = statusEmoji[member.status] || "❓";
      const status = statusLabel[member.status] || member.status;

      // Obuna ma'lumotlari
      let subInfo = "📋 Obuna: Yo'q";
      if (member.subscription && member.subscription.type) {
        const subType = subLabel[member.subscription.type] || member.subscription.type;
        const subStatus = member.subscription.status === "active" ? "✅ Faol" : "⛔ Tugagan";
        subInfo =
          `📋 *Obuna:* ${subType}\n` +
          `   ├ Holat: ${subStatus}\n` +
          `   ├ Boshlanish: ${formatDate(member.subscription.startDate)}\n` +
          `   ├ Tugash: ${formatDate(member.subscription.endDate)}\n` +
          `   └ Narx: ${formatCurrency(member.subscription.price)}`;
      }

      // Oxirgi tashriflar
      let visitsInfo = "";
      if (visits.length > 0) {
        visitsInfo = "\n\n🚪 *Oxirgi tashriflar:*\n";
        visits.forEach((v, i) => {
          const prefix = i === visits.length - 1 ? "└" : "├";
          const dur = v.duration ? ` (${v.duration} daq)` : "";
          visitsInfo += `   ${prefix} ${formatDateTime(v.checkInTime)}${dur}\n`;
        });
      }

      // Oxirgi xaridlar
      let purchasesInfo = "";
      if (purchases.length > 0) {
        purchasesInfo = "\n🛒 *Xaridlar:*\n";
        purchases.slice(0, 5).forEach((p, i) => {
          const prefix = i === Math.min(purchases.length, 5) - 1 ? "└" : "├";
          purchasesInfo += `   ${prefix} ${p.description || "Mahsulot"} — ${formatCurrency(p.amount)}\n`;
        });
      }

      // Obuna to'lovlari
      let subPayInfo = "";
      if (subPayments.length > 0) {
        subPayInfo = "\n💳 *Obuna to'lovlari:*\n";
        subPayments.slice(0, 5).forEach((p, i) => {
          const prefix = i === Math.min(subPayments.length, 5) - 1 ? "└" : "├";
          const method = payMethodLabel[p.paymentMethod] || p.paymentMethod;
          subPayInfo += `   ${prefix} ${formatDate(p.createdAt)} — ${formatCurrency(p.amount)} (${method})\n`;
        });
      }

      const message =
        `${emoji} *${member.fullName}*\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🆔 ID: \`${member.memberId}\`\n` +
        `📞 Tel: ${member.phone || "—"}\n` +
        `📧 Email: ${member.email || "—"}\n` +
        `📅 Ro'yxatdan: ${formatDate(member.createdAt)}\n` +
        `🔘 Holat: ${status}\n\n` +
        `${subInfo}` +
        `\n\n📊 *Statistika:*\n` +
        `   ├ Jami tashriflar: ${totalVisits} ta\n` +
        `   ├ Jami sarflangan: ${formatCurrency(totalSpent)}\n` +
        `   └ Xaridlar: ${formatCurrency(purchases.reduce((s, p) => s + p.amount, 0))}` +
        `${visitsInfo}${purchasesInfo}${subPayInfo}`;

      bot.sendMessage(msg.chat.id, message, { parse_mode: "Markdown" });
    } catch (err) {
      console.error("Bot xatolik:", err);
      bot.sendMessage(msg.chat.id, "⚠️ Xatolik yuz berdi, qayta urinib ko'ring.");
    }
  });

  return bot;
}
