import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Member from "./models/Member.js";
import Product from "./models/Product.js";
import Payment from "./models/Payment.js";
import Visit from "./models/Visit.js";
import Settings from "./models/Settings.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

async function seed() {
  try {
    console.log("MongoDB ga ulanmoqda...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB ulandi!");

    // ── Clear existing data ──────────────────────────────────────────────
    console.log("Eski ma'lumotlar tozalanmoqda...");
    await Promise.all([
      User.deleteMany({}),
      Member.deleteMany({}),
      Product.deleteMany({}),
      Payment.deleteMany({}),
      Visit.deleteMany({}),
      Settings.deleteMany({}),
    ]);

    // ── 1. Admin User ────────────────────────────────────────────────────
    console.log("Admin foydalanuvchi yaratilmoqda...");
    const admin = await User.create({
      username: "admin",
      password: "admin123",
      fullName: "Rahmatullayev Admin",
      email: "admin@fitnesspro.uz",
      phone: "+998901234567",
      role: "admin",
    });
    console.log(`  ✓ Admin yaratildi: ${admin.username} / admin123`);

    // ── 2. Settings ──────────────────────────────────────────────────────
    console.log("Sozlamalar yaratilmoqda...");
    await Settings.create({
      gymName: "FitnessPro Gym",
      address: "Toshkent sh., Chilonzor tumani, 7-mavze",
      phone: "+998712001020",
      workingHours: "06:00 - 23:00",
      pricing: { daily: 30000, monthly: 300000, yearly: 2500000 },
      notifications: {
        subscriptionExpiry: true,
        lowStock: true,
        newMember: false,
        dailyReport: true,
        paymentConfirmation: false,
      },
    });
    console.log("  ✓ Sozlamalar yaratildi");

    // ── 3. Members ───────────────────────────────────────────────────────
    console.log("A'zolar yaratilmoqda...");
    const now = new Date();
    const membersData = [
      {
        fullName: "Azimov Sardor",
        phone: "+998901112233",
        email: "sardor@gmail.com",
        dateOfBirth: "1995-03-15",
        address: "Toshkent, Yunusobod",
        status: "active",
        subscription: {
          type: "monthly",
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          price: 300000,
          status: "active",
        },
      },
      {
        fullName: "Karimova Dilnoza",
        phone: "+998902223344",
        email: "dilnoza@gmail.com",
        dateOfBirth: "1998-07-22",
        address: "Toshkent, Mirzo Ulug'bek",
        status: "active",
        subscription: {
          type: "yearly",
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: new Date(now.getFullYear(), 11, 31),
          price: 2500000,
          status: "active",
        },
      },
      {
        fullName: "Rahimov Jasur",
        phone: "+998903334455",
        email: "jasur@gmail.com",
        dateOfBirth: "1992-11-08",
        address: "Toshkent, Chilonzor",
        status: "active",
        subscription: {
          type: "monthly",
          startDate: new Date(now.getFullYear(), now.getMonth(), 5),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
          price: 300000,
          status: "active",
        },
      },
      {
        fullName: "Umarova Madina",
        phone: "+998904445566",
        email: "madina@gmail.com",
        dateOfBirth: "2000-01-12",
        address: "Toshkent, Sergeli",
        status: "active",
        subscription: {
          type: "monthly",
          startDate: new Date(now.getFullYear(), now.getMonth(), 10),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 10),
          price: 300000,
          status: "active",
        },
      },
      {
        fullName: "Toshmatov Bekzod",
        phone: "+998905556677",
        email: "bekzod@gmail.com",
        dateOfBirth: "1997-05-30",
        address: "Toshkent, Yakkasaroy",
        status: "active",
        subscription: {
          type: "daily",
          startDate: new Date(),
          endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          price: 30000,
          status: "active",
        },
      },
      {
        fullName: "Abdullayev Sherzod",
        phone: "+998906667788",
        email: "sherzod@gmail.com",
        dateOfBirth: "1993-09-17",
        address: "Toshkent, Olmazor",
        status: "expired",
        subscription: {
          type: "monthly",
          startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
          endDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          price: 300000,
          status: "expired",
        },
      },
      {
        fullName: "Ismoilova Zulfiya",
        phone: "+998907778899",
        email: "zulfiya@gmail.com",
        dateOfBirth: "1999-12-25",
        address: "Toshkent, Shayxontohur",
        status: "expired",
        subscription: {
          type: "monthly",
          startDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
          endDate: new Date(now.getFullYear(), now.getMonth(), 15 - 30),
          price: 300000,
          status: "expired",
        },
      },
      {
        fullName: "Nurmatov Oybek",
        phone: "+998908889900",
        email: "oybek@gmail.com",
        dateOfBirth: "1996-06-05",
        address: "Toshkent, Uchtepa",
        status: "active",
        subscription: {
          type: "yearly",
          startDate: new Date(now.getFullYear(), 0, 15),
          endDate: new Date(now.getFullYear(), 11, 15),
          price: 2500000,
          status: "active",
        },
      },
      {
        fullName: "Xolmatova Gulnora",
        phone: "+998909990011",
        email: "gulnora@gmail.com",
        dateOfBirth: "2001-04-20",
        address: "Toshkent, Bektemir",
        status: "inactive",
        subscription: null,
      },
      {
        fullName: "Qodirov Javlon",
        phone: "+998911001122",
        email: "javlon@gmail.com",
        dateOfBirth: "1994-08-11",
        address: "Toshkent, Mirobod",
        status: "active",
        subscription: {
          type: "monthly",
          startDate: new Date(now.getFullYear(), now.getMonth(), 3),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 3),
          price: 300000,
          status: "active",
        },
      },
      {
        fullName: "Salimov Doniyor",
        phone: "+998912112233",
        email: "doniyor@gmail.com",
        dateOfBirth: "1991-02-14",
        address: "Toshkent, Yashnobod",
        status: "active",
        subscription: {
          type: "monthly",
          startDate: new Date(now.getFullYear(), now.getMonth(), 7),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 7),
          price: 300000,
          status: "active",
        },
      },
      {
        fullName: "Ergasheva Nargiza",
        phone: "+998913223344",
        email: "nargiza@gmail.com",
        dateOfBirth: "2002-10-03",
        address: "Toshkent, Chilonzor",
        status: "active",
        subscription: {
          type: "monthly",
          startDate: new Date(now.getFullYear(), now.getMonth(), 12),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 12),
          price: 300000,
          status: "active",
        },
      },
    ];

    const members = await Member.insertMany(
      membersData.map((m) => ({
        ...m,
        subscription: m.subscription || undefined,
      }))
    );
    console.log(`  ✓ ${members.length} ta a'zo yaratildi`);

    // ── 4. Products ──────────────────────────────────────────────────────
    console.log("Mahsulotlar yaratilmoqda...");
    const productsData = [
      { name: "Suv 0.5L", category: "drink", price: 5000, costPrice: 2500, stockQuantity: 50, minStockAlert: 10 },
      { name: "Suv 1L", category: "drink", price: 8000, costPrice: 4000, stockQuantity: 40, minStockAlert: 10 },
      { name: "Coca-Cola 0.5L", category: "drink", price: 12000, costPrice: 8000, stockQuantity: 30, minStockAlert: 8 },
      { name: "Fanta 0.5L", category: "drink", price: 12000, costPrice: 8000, stockQuantity: 25, minStockAlert: 8 },
      { name: "Energetik Red Bull", category: "drink", price: 25000, costPrice: 18000, stockQuantity: 15, minStockAlert: 5 },
      { name: "Snickers", category: "chocolate", price: 10000, costPrice: 7000, stockQuantity: 20, minStockAlert: 5 },
      { name: "Mars", category: "chocolate", price: 10000, costPrice: 7000, stockQuantity: 18, minStockAlert: 5 },
      { name: "Protein Bar", category: "chocolate", price: 25000, costPrice: 16000, stockQuantity: 12, minStockAlert: 5 },
      { name: "Oqsil Kokteyli", category: "cocktail", price: 35000, costPrice: 20000, stockQuantity: 8, minStockAlert: 3 },
      { name: "BCAA Kokteyli", category: "cocktail", price: 30000, costPrice: 18000, stockQuantity: 10, minStockAlert: 3 },
      { name: "Kreatin Kokteyli", category: "cocktail", price: 28000, costPrice: 15000, stockQuantity: 6, minStockAlert: 3 },
      { name: "Yogurt 200ml", category: "yogurt", price: 15000, costPrice: 9000, stockQuantity: 20, minStockAlert: 5 },
      { name: "Protein Yogurt", category: "yogurt", price: 22000, costPrice: 14000, stockQuantity: 10, minStockAlert: 3 },
    ];

    const products = await Product.insertMany(productsData);
    console.log(`  ✓ ${products.length} ta mahsulot yaratildi`);

    // ── 5. Payments ──────────────────────────────────────────────────────
    console.log("To'lovlar yaratilmoqda...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const paymentsData = [
      // Bugungi to'lovlar
      {
        memberName: "Azimov Sardor",
        type: "income",
        category: "subscription",
        amount: 300000,
        paymentMethod: "cash",
        description: "Oylik abonement",
        createdAt: new Date(today.getTime() + 9 * 60 * 60 * 1000),
      },
      {
        memberName: "Umarova Madina",
        type: "income",
        category: "subscription",
        amount: 30000,
        paymentMethod: "card",
        description: "Kunlik abonement",
        createdAt: new Date(today.getTime() + 10.5 * 60 * 60 * 1000),
      },
      {
        memberName: "Mahsulot sotilishi",
        type: "income",
        category: "product",
        amount: 35000,
        paymentMethod: "cash",
        description: "Oqsil kokteyli",
        createdAt: new Date(today.getTime() + 11 * 60 * 60 * 1000),
      },
      {
        memberName: "Toshmatov Bekzod",
        type: "income",
        category: "subscription",
        amount: 30000,
        paymentMethod: "cash",
        description: "Kunlik abonement",
        createdAt: new Date(today.getTime() + 12 * 60 * 60 * 1000),
      },
      {
        type: "expense",
        category: "salary",
        amount: 3000000,
        paymentMethod: "transfer",
        description: "Trener oyligi - Fevral",
        createdAt: new Date(today.getTime() + 8 * 60 * 60 * 1000),
      },
      {
        type: "expense",
        category: "utility",
        amount: 500000,
        paymentMethod: "transfer",
        description: "Elektr energiya",
        createdAt: new Date(today.getTime() + 14 * 60 * 60 * 1000),
      },
      // Oldingi kunlardagi to'lovlar
      ...Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - i - 1);
        d.setHours(9 + Math.floor(Math.random() * 10));
        return {
          memberName: membersData[Math.floor(Math.random() * 5)].fullName,
          type: "income",
          category: Math.random() > 0.3 ? "subscription" : "product",
          amount: Math.random() > 0.5 ? 300000 : 30000 + Math.floor(Math.random() * 30000),
          paymentMethod: ["cash", "card", "transfer"][Math.floor(Math.random() * 3)],
          description: Math.random() > 0.3 ? "Oylik abonement" : "Mahsulot sotilishi",
          createdAt: d,
        };
      }),
      ...Array.from({ length: 10 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - i * 3 - 1);
        d.setHours(8 + Math.floor(Math.random() * 4));
        return {
          type: "expense",
          category: ["salary", "utility", "rent", "other"][Math.floor(Math.random() * 4)],
          amount: 200000 + Math.floor(Math.random() * 2800000),
          paymentMethod: "transfer",
          description: ["Ish haqi", "Kommunal xizmat", "Ijara haqi", "Jihozlar ta'miri"][Math.floor(Math.random() * 4)],
          createdAt: d,
        };
      }),
    ];

    await Payment.insertMany(paymentsData);
    console.log(`  ✓ ${paymentsData.length} ta to'lov yaratildi`);

    // ── 6. Visits ────────────────────────────────────────────────────────
    console.log("Tashriflar yaratilmoqda...");
    const activeMembers = members.filter((m) => m.status === "active");

    const visitsData = [];

    // Bugungi faol tashriflar (hozir zalda)
    const gymMembers = activeMembers.slice(0, 4);
    for (let i = 0; i < gymMembers.length; i++) {
      const checkInHour = 8 + i;
      visitsData.push({
        memberId: gymMembers[i]._id,
        memberName: gymMembers[i].fullName,
        checkInTime: new Date(today.getTime() + checkInHour * 60 * 60 * 1000),
        checkOutTime: null,
        duration: null,
      });
    }

    // Bugungi tugallangan tashriflar
    for (let i = 0; i < 3; i++) {
      const m = activeMembers[(i + 4) % activeMembers.length];
      const checkInHour = 6 + i;
      const duration = 60 + Math.floor(Math.random() * 90);
      visitsData.push({
        memberId: m._id,
        memberName: m.fullName,
        checkInTime: new Date(today.getTime() + checkInHour * 60 * 60 * 1000),
        checkOutTime: new Date(today.getTime() + (checkInHour * 60 + duration) * 60 * 1000),
        duration,
      });
    }

    // Oldingi kunlardagi tashriflar
    for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
      const visitCount = 3 + Math.floor(Math.random() * 5);
      for (let v = 0; v < visitCount; v++) {
        const m = activeMembers[Math.floor(Math.random() * activeMembers.length)];
        const d = new Date(today);
        d.setDate(d.getDate() - dayOffset);
        const checkInHour = 6 + Math.floor(Math.random() * 14);
        const duration = 45 + Math.floor(Math.random() * 120);
        visitsData.push({
          memberId: m._id,
          memberName: m.fullName,
          checkInTime: new Date(d.getTime() + checkInHour * 60 * 60 * 1000),
          checkOutTime: new Date(d.getTime() + (checkInHour * 60 + duration) * 60 * 1000),
          duration,
        });
      }
    }

    await Visit.insertMany(visitsData);
    console.log(`  ✓ ${visitsData.length} ta tashrif yaratildi`);

    // ── Done ─────────────────────────────────────────────────────────────
    console.log("\n════════════════════════════════════════════");
    console.log("  ✅ Seed muvaffaqiyatli yakunlandi!");
    console.log("════════════════════════════════════════════");
    console.log(`  👤 Admin: admin / admin123`);
    console.log(`  👥 A'zolar: ${members.length} ta`);
    console.log(`  📦 Mahsulotlar: ${products.length} ta`);
    console.log(`  💰 To'lovlar: ${paymentsData.length} ta`);
    console.log(`  🚶 Tashriflar: ${visitsData.length} ta`);
    console.log("════════════════════════════════════════════\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed xatoligi:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
