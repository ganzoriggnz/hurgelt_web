import { IOrderProducts } from "@/types/next";
import mongoose from "mongoose";

const Schema = mongoose.Schema;
const OrderProductsSchema = new Schema<IOrderProducts>(
  {
    order_number: { required: true, type: String, default: null },
    customer: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customers",
      default: null,
    },
    product: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      default: null,
    },
    jolooch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
      alias: "Жолоочийн  _id хэрэглэгчийн  ",
    },
    jolooch_username: {
      type: String,
      default: null,
      alias: "Жолоочийн username хэрэглэгчийн  ",
    },
    product_code: { type: String, default: null },
    product_name: { type: String, default: null },
    delivery_price: { type: Number, default: 0 },
    sale_price: { type: Number, default: 0 },
    too: { type: Number, default: 1 },
    isDeleted: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const OrderProductsModel =
  mongoose.models?.OrdersProducts ||
  mongoose.model("OrdersProducts", OrderProductsSchema);
export default OrderProductsModel;
