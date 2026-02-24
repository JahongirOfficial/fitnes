import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";
import Payment from "../models/Payment.js";
import Member from "../models/Member.js";
import Debt from "../models/Debt.js";
import StockMovement from "../models/StockMovement.js";
import Notification from "../models/Notification.js";
import Settings from "../models/Settings.js";
import { verifyToken } from "../middleware/auth.js";
import { uploadProductImage } from "../middleware/upload.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

function removeImageFile(imagePath) {
  if (!imagePath) return;
  const fullPath = path.join(__dirname, "../../public", imagePath);
  fs.unlink(fullPath, () => {});
}

// GET /api/products
router.get("/", verifyToken, async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) filter.name = { $regex: search, $options: "i" };
    if (category && category !== "all") filter.category = category;

    const products = await Product.find(filter).sort({ name: 1 }).populate("recipe.ingredientId", "name stockQuantity");

    const stats = {
      totalProducts: await Product.countDocuments(),
      warehouseValue: products.reduce((sum, p) => sum + p.price * p.stockQuantity, 0),
      lowStockCount: products.filter((p) => p.stockQuantity <= p.minStockAlert).length,
    };

    res.json({ products, stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products
router.post("/", verifyToken, uploadProductImage.single("image"), async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      category: req.body.category,
      price: Number(req.body.price),
      costPrice: Number(req.body.costPrice) || 0,
      stockQuantity: Number(req.body.stockQuantity) || 0,
      minStockAlert: Number(req.body.minStockAlert) || 5,
      recipe: req.body.recipe ? JSON.parse(req.body.recipe) : [],
    };

    if (req.file) {
      data.image = `/uploads/products/${req.file.filename}`;
    }

    const product = new Product(data);
    await product.save();

    // Boshlang'ich zaxira qaydnomasi
    if (data.stockQuantity > 0) {
      await new StockMovement({
        productId: product._id,
        type: "restock",
        quantity: data.stockQuantity,
        previousStock: 0,
        newStock: data.stockQuantity,
        description: "Boshlang'ich zaxira (mahsulot yaratish)",
        createdBy: "Admin",
      }).save();
    }

    res.status(201).json(product);
  } catch (err) {
    if (req.file) removeImageFile(`/uploads/products/${req.file.filename}`);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/products/:id
router.put("/:id", verifyToken, uploadProductImage.single("image"), async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Mahsulot topilmadi" });

    const data = {
      name: req.body.name,
      category: req.body.category,
      price: Number(req.body.price),
      costPrice: Number(req.body.costPrice) || 0,
      stockQuantity: Number(req.body.stockQuantity) || 0,
      minStockAlert: Number(req.body.minStockAlert) || 5,
      recipe: req.body.recipe ? JSON.parse(req.body.recipe) : [],
    };

    if (req.file) {
      removeImageFile(existing.image);
      data.image = `/uploads/products/${req.file.filename}`;
    } else if (req.body.removeImage === "true") {
      removeImageFile(existing.image);
      data.image = null;
    }

    // Zaxira o'zgargan bo'lsa qayd yaratish
    const oldStock = existing.stockQuantity;
    const newStock = data.stockQuantity;
    if (oldStock !== newStock) {
      const diff = newStock - oldStock;
      await new StockMovement({
        productId: existing._id,
        type: diff > 0 ? "restock" : "adjustment",
        quantity: diff,
        previousStock: oldStock,
        newStock: newStock,
        description: diff > 0
          ? `${diff} ta to'ldirildi`
          : `${Math.abs(diff)} ta tuzatish (kamaytirildi)`,
        createdBy: "Admin",
      }).save();
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(product);
  } catch (err) {
    if (req.file) removeImageFile(`/uploads/products/${req.file.filename}`);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/products/:id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      removeImageFile(product.image);
      await Product.findByIdAndDelete(req.params.id);
    }
    res.json({ message: "Mahsulot o'chirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id/history — Mahsulot tarixi
router.get("/:id/history", verifyToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

    // Sotuvlar (Payment jadvalidan)
    const sales = await Payment.find({
      productId: product._id,
      category: "product",
    }).sort({ createdAt: -1 }).limit(100);

    // Zaxira harakatlari
    const stockMovements = await StockMovement.find({
      productId: product._id,
    }).sort({ createdAt: -1 }).limit(100);

    // Bugungi sotuv
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = await Payment.find({
      productId: product._id,
      category: "product",
      createdAt: { $gte: today },
    });

    // Statistika
    const allSales = await Payment.find({
      productId: product._id,
      category: "product",
    });

    const totalSold = allSales.reduce((sum, s) => {
      // Descriptiondan miqdorni olish: "Name x5 sotildi"
      const match = s.description?.match(/x(\d+)/);
      return sum + (match ? Number(match[1]) : 1);
    }, 0);

    const todaySoldCount = todaySales.reduce((sum, s) => {
      const match = s.description?.match(/x(\d+)/);
      return sum + (match ? Number(match[1]) : 1);
    }, 0);

    const totalRevenue = allSales.reduce((sum, s) => sum + s.amount, 0);
    const totalCost = totalSold * (product.costPrice || 0);

    res.json({
      product,
      sales,
      stockMovements,
      stats: {
        totalSold,
        todaySold: todaySoldCount,
        totalRevenue,
        profit: totalRevenue - totalCost,
        todayRevenue: todaySales.reduce((sum, s) => sum + s.amount, 0),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id — Bitta mahsulot
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products/:id/restock - Mahsulot qabul qilish
router.post("/:id/restock", verifyToken, async (req, res) => {
  try {
    const { quantity, costPrice } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Miqdorni kiriting" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

    const previousStock = product.stockQuantity;
    product.stockQuantity += quantity;
    if (costPrice !== undefined && costPrice > 0) {
      product.costPrice = costPrice;
    }
    await product.save();

    // StockMovement qayd
    await new StockMovement({
      productId: product._id,
      type: "restock",
      quantity: quantity,
      previousStock,
      newStock: product.stockQuantity,
      description: `${product.name} x${quantity} qabul qilindi`,
      createdBy: "Admin",
    }).save();

    // Xarajat Payment yaratish (tan narxi * miqdor)
    const totalCost = (costPrice || product.costPrice || 0) * quantity;
    if (totalCost > 0) {
      await new Payment({
        productId: product._id,
        type: "expense",
        category: "product",
        amount: totalCost,
        paymentMethod: "cash",
        description: `${product.name} x${quantity} qabul qilindi (tan narxi)`,
        createdBy: "Admin",
      }).save();
    }

    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products/:id/sell - Sell product
router.post("/:id/sell", verifyToken, async (req, res) => {
  try {
    const { quantity = 1, paymentMethod = "cash", memberId, memberName } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

    // Kokteyl retsepti bo'lsa — ingredientlarni tekshirish
    const hasRecipe = product.recipe && product.recipe.length > 0;
    if (hasRecipe) {
      for (const item of product.recipe) {
        const ingredient = await Product.findById(item.ingredientId);
        const needed = item.quantity * quantity;
        if (!ingredient || ingredient.stockQuantity < needed) {
          const ingName = ingredient?.name || "Ingredient";
          return res.status(400).json({ message: `${ingName} yetarli emas (kerak: ${needed}, mavjud: ${ingredient?.stockQuantity ?? 0})` });
        }
      }
    } else if (product.stockQuantity < quantity) {
      return res.status(400).json({ message: "Yetarli mahsulot yo'q" });
    }

    // Balansdan to'lash (manfiy bo'lishi mumkin → qarz yaratiladi)
    if (paymentMethod === "balance") {
      if (!memberId) {
        return res.status(400).json({ message: "Balans bilan to'lash uchun a'zo tanlang" });
      }
      const member = await Member.findById(memberId);
      if (!member) return res.status(404).json({ message: "A'zo topilmadi" });
      const totalAmount = product.price * quantity;
      await Member.findByIdAndUpdate(memberId, { $inc: { balance: -totalAmount } });

      // Manfiy balansni qarzga aylantirish
      const updatedMember = await Member.findById(memberId);
      if ((updatedMember.balance || 0) < 0) {
        const debtAmount = Math.abs(updatedMember.balance);
        await Member.findByIdAndUpdate(memberId, { balance: 0 });

        const existingDebt = await Debt.findOne({
          memberId,
          status: { $in: ["unpaid", "partial"] },
          description: /balans/i,
        });

        if (existingDebt) {
          existingDebt.amount += debtAmount;
          existingDebt.remainingAmount += debtAmount;
          existingDebt.status = existingDebt.paidAmount > 0 ? "partial" : "unpaid";
          await existingDebt.save();
        } else {
          await new Debt({
            memberId,
            personName: memberName || member.fullName,
            phone: member.phone,
            amount: debtAmount,
            remainingAmount: debtAmount,
            description: "Mahsulot sotib olish qarzi",
            createdBy: "Tizim",
          }).save();
        }
      }
    }

    if (hasRecipe) {
      // Kokteyl: ingredientlardan kamaytirish
      for (const item of product.recipe) {
        const ingredient = await Product.findById(item.ingredientId);
        const needed = item.quantity * quantity;
        const prevIngStock = ingredient.stockQuantity;
        const newIngStock = prevIngStock - needed;
        await Product.findByIdAndUpdate(item.ingredientId, { $inc: { stockQuantity: -needed } });
        await new StockMovement({
          productId: item.ingredientId,
          type: "sale",
          quantity: -needed,
          previousStock: prevIngStock,
          newStock: newIngStock,
          description: `${ingredient.name} — ${product.name} x${quantity} uchun ishlatildi`,
          memberId: memberId || undefined,
          memberName: memberName || undefined,
          createdBy: "Kassir",
        }).save();
      }
      // Kokteylning o'z stocki o'zgarmaydi
    } else {
      const previousStock = product.stockQuantity;
      product.stockQuantity -= quantity;
      await product.save();

      // StockMovement qayd
      await new StockMovement({
        productId: product._id,
        type: "sale",
        quantity: -quantity,
        previousStock,
        newStock: product.stockQuantity,
        description: `${product.name} x${quantity} sotildi`,
        memberId: memberId || undefined,
        memberName: memberName || undefined,
        createdBy: "Kassir",
      }).save();
    }

    // Payment yaratish (productId bilan)
    const payment = new Payment({
      memberId,
      memberName,
      productId: product._id,
      type: "income",
      category: "product",
      amount: product.price * quantity,
      paymentMethod,
      description: `${product.name} x${quantity} sotildi`,
      createdBy: "Kassir",
    });
    await payment.save();

    // Kam qoldiq bildirishnomasi
    if (product.stockQuantity <= 5 && product.stockQuantity > 0) {
      try {
        const settings = await Settings.findOne();
        if (settings?.notifications?.lowStock !== false) {
          const exists = await Notification.findOne({
            type: "low_stock",
            productId: product._id,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          });
          if (!exists) {
            await new Notification({
              type: "low_stock",
              title: `${product.name} kam qoldiq!`,
              description: `Faqat ${product.stockQuantity} ta qoldi`,
              productId: product._id,
            }).save();
          }
        }
      } catch (_) { /* notification xatosi asosiy oqimni to'xtatmasin */ }
    }

    res.json({ product, payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
