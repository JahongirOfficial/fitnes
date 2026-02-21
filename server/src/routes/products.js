import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";
import Payment from "../models/Payment.js";
import Member from "../models/Member.js";
import Debt from "../models/Debt.js";
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

    const products = await Product.find(filter).sort({ name: 1 });

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
    };

    if (req.file) {
      data.image = `/uploads/products/${req.file.filename}`;
    }

    const product = new Product(data);
    await product.save();
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
    };

    if (req.file) {
      removeImageFile(existing.image);
      data.image = `/uploads/products/${req.file.filename}`;
    } else if (req.body.removeImage === "true") {
      removeImageFile(existing.image);
      data.image = null;
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

// POST /api/products/:id/sell - Sell product
router.post("/:id/sell", verifyToken, async (req, res) => {
  try {
    const { quantity = 1, paymentMethod = "cash", memberId, memberName } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Mahsulot topilmadi" });

    if (product.stockQuantity < quantity) {
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

    product.stockQuantity -= quantity;
    await product.save();

    // Create payment record
    const payment = new Payment({
      memberId,
      memberName,
      type: "income",
      category: "product",
      amount: product.price * quantity,
      paymentMethod,
      description: `${product.name} x${quantity} sotildi`,
      createdBy: "Kassir",
    });
    await payment.save();

    res.json({ product, payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
