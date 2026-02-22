// Telegram orqali a'zolarga bildirishnoma yuborish

export async function sendTgNotify(chatId, text) {
  if (!chatId) return;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[TG Notify] Xatolik:", err);
    }
  } catch (err) {
    console.error("[TG Notify] So'rov xatoligi:", err.message);
  }
}
