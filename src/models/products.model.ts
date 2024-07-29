import mongoose from "mongoose";
import { IProduct } from "../types/next";

const Schema = mongoose.Schema;
const productSchema = new Schema<IProduct>(
  {
    code: {
      required: true,
      type: String,
    },
    name: {
      type: String,
      default: "",
    },
    tailbar: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    delivery_price: {
      type: Number,
      default: 5000,
    },
    total_price: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      default: "Үндсэн",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
productSchema.index({ code: 1 }, { unique: true });

const ProductModel =
  mongoose.models.Products || mongoose.model("Products", productSchema);
export default ProductModel;
