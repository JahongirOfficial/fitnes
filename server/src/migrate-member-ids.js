import mongoose from "mongoose";
import dotenv from "dotenv";
import QRCode from "qrcode";
import Member from "./models/Member.js";

dotenv.config();

function generateRandomId(existingIds) {
  for (let i = 0; i < 100; i++) {
    const id = String(Math.floor(10000000 + Math.random() * 90000000));
    if (!existingIds.has(id)) {
      existingIds.add(id);
      return id;
    }
  }
  throw new Error("Unikal ID yaratib bo'lmadi");
}

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB ulandi");

  // Mavjud ID larni yig'ish (takrorlanmaslik uchun)
  const existingIds = new Set();

  const members = await Member.find().sort({ createdAt: 1 });
  console.log(`${members.length} ta a'zoga tasodifiy 8-raqamli ID beriladi`);

  for (const member of members) {
    member.memberId = generateRandomId(existingIds);

    const qrData = JSON.stringify({
      id: member._id,
      memberId: member.memberId,
      name: member.fullName,
    });
    member.qrCode = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });

    await member.save();
    console.log(`  ${member.fullName} -> ${member.memberId}`);
  }

  console.log("Migratsiya tugadi!");
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(console.error);
