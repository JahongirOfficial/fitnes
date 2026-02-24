import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["drink", "chocolate", "cocktail", "yogurt"],
      required: true,
    },
    price: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    stockQuantity: { type: Number, required: true, default: 0 },
    minStockAlert: { type: Number, default: 5 },
    image: { type: String, default: null },
    recipe: [
      {
        ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
