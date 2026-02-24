import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ExcelJS from "exceljs";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TOKEN = process.env.BOT_TOKEN;
const DATA_FILE = path.join(__dirname, "data.json");

// ─── Ma'lumotlar ─────────────────────────────────────────────────────────────

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ categories: [], products: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ─── Bot ─────────────────────────────────────────────────────────────────────

const bot = new TelegramBot(TOKEN, { polling: false });

let pollingActive = false;
let restartTimer = null;

function scheduleRestart(delayMs = 8000) {
  if (restartTimer) clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    restartTimer = null;
    startPolling();
  }, delayMs);
}

function startPolling() {
  if (pollingActive) return;
  pollingActive = true;
  bot.startPolling().catch((err) => {
    console.error("startPolling xatolik:", err.message);
    pollingActive = false;
    scheduleRestart(10000);
  });
}

startPolling();

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

// Foydalanuvchi holatlari
const states = {};

// ─── Asosiy menyu ─────────────────────────────────────────────────────────────

const MAIN_KEYBOARD = {
  reply_markup: {
    keyboard: [
      ["🗂 Kategoriyalar", "➕ Mahsulot qo'shish"],
      ["📦 Mahsulotlar ro'yxati", "📊 Excel yuklab olish"],
    ],
    resize_keyboard: true,
    persistent: true,
  },
};

function sendMainMenu(chatId, text = "🏠 Asosiy menyu") {
  states[chatId] = null;
  return bot.sendMessage(chatId, text, MAIN_KEYBOARD);
}

// ─── /start ───────────────────────────────────────────────────────────────────

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  states[chatId] = null;
  bot.sendMessage(
    chatId,
    "👋 *Mahsulot Baza Botiga xush kelibsiz!*\n\nQuyidagi tugmalardan foydalaning:",
    { parse_mode: "Markdown", ...MAIN_KEYBOARD }
  );
});

// ─── Kategoriyalar ko'rsatish ─────────────────────────────────────────────────

function showCategories(chatId) {
  const data = loadData();
  const cats = data.categories;

  const buttons = cats.map((cat) => {
    const count = data.products.filter((p) => p.category === cat).length;
    return [
      { text: `📁 ${cat} (${count})`, callback_data: `cat_view:${cat}` },
      { text: `🗑`, callback_data: `cat_delete:${cat}` },
    ];
  });

  buttons.push([{ text: "➕ Kategoriya qo'shish", callback_data: "add_category" }]);

  return bot.sendMessage(
    chatId,
    cats.length > 0
      ? `🗂 *Kategoriyalar* (${cats.length} ta):\n\n📁 — ko'rish  |  🗑 — o'chirish`
      : "🗂 Hali kategoriya qo'shilmagan.\n\nPastdagi tugma orqali qo'shing:",
    { parse_mode: "Markdown", reply_markup: { inline_keyboard: buttons } }
  );
}

// ─── Mahsulotlar ro'yxati ─────────────────────────────────────────────────────

function showProducts(chatId) {
  const data = loadData();

  if (data.products.length === 0) {
    return bot.sendMessage(chatId, "📦 Hali mahsulot qo'shilmagan.", MAIN_KEYBOARD);
  }

  // Kategoriya bo'yicha guruhlash
  const grouped = {};
  data.products.forEach((p) => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });

  let text = `📦 *Mahsulotlar ro'yxati* (${data.products.length} ta):\n\n`;

  for (const [cat, prods] of Object.entries(grouped)) {
    text += `📁 *${cat}*\n`;
    prods.forEach((p, i) => {
      text += `  ${i + 1}. ${p.name}\n`;
    });
    text += "\n";
  }

  return bot.sendMessage(chatId, text, { parse_mode: "Markdown", ...MAIN_KEYBOARD });
}

// ─── Excel generatsiya ────────────────────────────────────────────────────────

async function generateExcel(chatId) {
  const data = loadData();

  if (data.products.length === 0) {
    return bot.sendMessage(chatId, "❌ Excel yaratish uchun avval mahsulot qo'shing.", MAIN_KEYBOARD);
  }

  await bot.sendMessage(chatId, "⏳ Excel fayl tayyorlanmoqda...");

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Mahsulot Bot";
  workbook.created = new Date();

  // ── 1-varaq: Barcha mahsulotlar ──
  const sheet = workbook.addWorksheet("Mahsulotlar");
  sheet.columns = [
    { header: "№", key: "num", width: 6 },
    { header: "Mahsulot nomi", key: "name", width: 40 },
    { header: "Kategoriya", key: "category", width: 25 },
    { header: "Qo'shilgan sana", key: "createdAt", width: 22 },
  ];

  // Header stil
  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1B5E20" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "medium", color: { argb: "FF1B5E20" } },
      bottom: { style: "medium", color: { argb: "FF1B5E20" } },
      left: { style: "thin", color: { argb: "FFCCCCCC" } },
      right: { style: "thin", color: { argb: "FFCCCCCC" } },
    };
  });

  // Kategoriya bo'yicha guruhlash va rang berish
  const grouped = {};
  data.products.forEach((p) => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });

  const catColors = [
    "FFFFF8E1",
    "FFE3F2FD",
    "FFF3E5F5",
    "FFE8F5E9",
    "FFFCE4EC",
    "FFFFE8D6",
    "FFE0F2F1",
    "FFF9FBE7",
  ];

  let rowIdx = 1;
  let colorIdx = 0;

  for (const [, prods] of Object.entries(grouped)) {
    const color = catColors[colorIdx % catColors.length];
    colorIdx++;

    prods.forEach((p) => {
      rowIdx++;
      const row = sheet.addRow({
        num: rowIdx - 1,
        name: p.name,
        category: p.category,
        createdAt: p.createdAt
          ? new Date(p.createdAt).toLocaleString("uz-UZ", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
      });

      row.height = 22;
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE0E0E0" } },
          bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } },
        };
        cell.alignment = { vertical: "middle" };
      });

      row.getCell("num").alignment = { vertical: "middle", horizontal: "center" };
    });
  }

  // ── 2-varaq: Kategoriyalar xulosasi ──
  const summarySheet = workbook.addWorksheet("Kategoriyalar");
  summarySheet.columns = [
    { header: "№", key: "num", width: 6 },
    { header: "Kategoriya nomi", key: "category", width: 30 },
    { header: "Mahsulotlar soni", key: "count", width: 18 },
  ];

  const summaryHeader = summarySheet.getRow(1);
  summaryHeader.height = 28;
  summaryHeader.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1565C0" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  Object.entries(grouped).forEach(([cat, prods], i) => {
    const row = summarySheet.addRow({ num: i + 1, category: cat, count: prods.length });
    row.height = 22;
    row.getCell("count").alignment = { horizontal: "center", vertical: "middle" };
  });

  const fileName = `mahsulotlar_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const filePath = path.join(__dirname, fileName);
  await workbook.xlsx.writeFile(filePath);

  await bot.sendDocument(chatId, filePath, {
    caption:
      `📊 *Mahsulotlar bazasi*\n\n` +
      `📦 Jami mahsulot: *${data.products.length} ta*\n` +
      `🗂 Kategoriyalar: *${data.categories.length} ta*\n` +
      `📅 Sana: ${new Date().toLocaleDateString("uz-UZ")}`,
    parse_mode: "Markdown",
  });

  fs.unlinkSync(filePath);
}

// ─── Xabar handleri ──────────────────────────────────────────────────────────

bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const state = states[chatId];

  if (text === "🗂 Kategoriyalar") {
    states[chatId] = null;
    return showCategories(chatId);
  }

  if (text === "➕ Mahsulot qo'shish") {
    const data = loadData();
    if (data.categories.length === 0) {
      return bot.sendMessage(
        chatId,
        "⚠️ Avval kamida 1 ta kategoriya qo'shing!\n\n\"🗂 Kategoriyalar\" → \"➕ Kategoriya qo'shish\"",
        MAIN_KEYBOARD
      );
    }
    states[chatId] = { step: "waiting_product_name" };
    return bot.sendMessage(chatId, "📝 Mahsulot nomini kiriting:\n\n_Bekor qilish:_ /bekor", {
      parse_mode: "Markdown",
    });
  }

  if (text === "📦 Mahsulotlar ro'yxati") {
    states[chatId] = null;
    return showProducts(chatId);
  }

  if (text === "📊 Excel yuklab olish") {
    states[chatId] = null;
    return generateExcel(chatId);
  }

  if (text === "/bekor") {
    return sendMainMenu(chatId, "❌ Bekor qilindi.");
  }

  // ── Kategoriya nomi kutilmoqda ──
  if (state?.step === "waiting_category_name") {
    const catName = text;
    const data = loadData();
    if (data.categories.some((c) => c.toLowerCase() === catName.toLowerCase())) {
      return bot.sendMessage(chatId, `⚠️ *"${catName}"* allaqachon mavjud.`, {
        parse_mode: "Markdown",
      });
    }
    data.categories.push(catName);
    saveData(data);
    states[chatId] = null;
    return bot.sendMessage(chatId, `✅ *"${catName}"* kategoriyasi qo'shildi!`, {
      parse_mode: "Markdown",
      ...MAIN_KEYBOARD,
    });
  }

  // ── Mahsulot nomi kutilmoqda ──
  if (state?.step === "waiting_product_name") {
    const name = text;
    const data = loadData();
    states[chatId] = { step: "waiting_product_category", name };

    const buttons = data.categories.map((cat) => [
      { text: `📁 ${cat}`, callback_data: `select_cat:${cat}` },
    ]);

    return bot.sendMessage(
      chatId,
      `📦 Mahsulot: *${name}*\n\n📁 Kategoriyani tanlang:`,
      { parse_mode: "Markdown", reply_markup: { inline_keyboard: buttons } }
    );
  }
});

// ─── Callback Query handleri ──────────────────────────────────────────────────

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const cbData = query.data;

  await bot.answerCallbackQuery(query.id);

  // ── Kategoriya qo'shish ──
  if (cbData === "add_category") {
    states[chatId] = { step: "waiting_category_name" };
    return bot.sendMessage(chatId, "📝 Yangi kategoriya nomini kiriting:\n\n_Bekor qilish:_ /bekor", {
      parse_mode: "Markdown",
    });
  }

  // ── Kategoriya ko'rish ──
  if (cbData.startsWith("cat_view:")) {
    const cat = cbData.replace("cat_view:", "");
    const data = loadData();
    const prods = data.products.filter((p) => p.category === cat);

    if (prods.length === 0) {
      return bot.sendMessage(chatId, `📁 *${cat}*\n\nBu kategoriyada hali mahsulot yo'q.`, {
        parse_mode: "Markdown",
      });
    }

    let text = `📁 *${cat}* — ${prods.length} ta mahsulot:\n\n`;
    prods.forEach((p, i) => {
      text += `${i + 1}. ${p.name}\n`;
    });

    return bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  }

  // ── Kategoriya o'chirish (tasdiqlash so'rash) ──
  if (cbData.startsWith("cat_delete:")) {
    const cat = cbData.replace("cat_delete:", "");
    const data = loadData();
    const count = data.products.filter((p) => p.category === cat).length;

    return bot.sendMessage(
      chatId,
      `🗑 *"${cat}"* kategoriyasini o'chirmoqchimisiz?\n\n` +
        (count > 0
          ? `⚠️ Bu bilan *${count} ta mahsulot* ham o'chiriladi!`
          : `Bu kategoriyada mahsulot yo'q.`),
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Ha, o'chir", callback_data: `cat_delete_confirm:${cat}` },
              { text: "❌ Bekor", callback_data: "cat_delete_cancel" },
            ],
          ],
        },
      }
    );
  }

  // ── Kategoriya o'chirishni tasdiqlash ──
  if (cbData.startsWith("cat_delete_confirm:")) {
    const cat = cbData.replace("cat_delete_confirm:", "");
    const data = loadData();
    const prodCount = data.products.filter((p) => p.category === cat).length;

    data.categories = data.categories.filter((c) => c !== cat);
    data.products = data.products.filter((p) => p.category !== cat);
    saveData(data);

    return bot.sendMessage(
      chatId,
      `✅ *"${cat}"* kategoriyasi o'chirildi.` +
        (prodCount > 0 ? `\n🗑 ${prodCount} ta mahsulot ham o'chirildi.` : ""),
      { parse_mode: "Markdown", ...MAIN_KEYBOARD }
    );
  }

  // ── Kategoriya o'chirishdan voz kechish ──
  if (cbData === "cat_delete_cancel") {
    return bot.sendMessage(chatId, "❌ Bekor qilindi.", MAIN_KEYBOARD);
  }

  // ── Kategoriya tanlash → mahsulotni saqlash ──
  if (cbData.startsWith("select_cat:")) {
    const cat = cbData.replace("select_cat:", "");
    const state = states[chatId];

    if (!state || state.step !== "waiting_product_category") {
      return bot.sendMessage(chatId, "⚠️ Avval mahsulot nomini kiriting.", MAIN_KEYBOARD);
    }

    const data = loadData();
    const product = {
      id: Date.now(),
      name: state.name,
      category: cat,
      createdAt: new Date().toISOString(),
    };
    data.products.push(product);
    saveData(data);
    states[chatId] = null;

    return bot.sendMessage(
      chatId,
      `✅ *Mahsulot qo'shildi!*\n\n📦 *${product.name}*\n📁 ${cat}\n\nJami: *${data.products.length} ta*`,
      { parse_mode: "Markdown", ...MAIN_KEYBOARD }
    );
  }
});

// ─── Xato handler ─────────────────────────────────────────────────────────────

bot.on("error", (err) => {
  console.error("Bot error:", err.message);
});

bot.on("polling_error", (err) => {
  const code = err.code || "";
  console.error("Polling xatolik:", code, err.message);

  if (code === "EFATAL" || code === "ETELEGRAM") {
    pollingActive = false;
    // 409 uchun uzoqroq kutish — Telegram eski sessionni tozalashi uchun
    const delay = err.message && err.message.includes("409") ? 30000 : 8000;
    console.log(`${code} — ${delay / 1000}s dan keyin qayta ulaniladi...`);
    bot.stopPolling().catch(() => {}).finally(() => {
      scheduleRestart(delay);
    });
  }
});

console.log("🤖 Mahsulot baza boti ishga tushdi!");
