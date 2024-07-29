import { IOrder } from "@/types/next";
import mongoose from "mongoose";

const Schema = mongoose.Schema;
const OrderSchema = new Schema<IOrder>(
  {
    order_number: {
      required: true,
      type: String,
      default: null,
      unigue: true,
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    owner_name: { type: String, default: null },
    type: { type: String, default: null, alias: "" },
    order_products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrdersProducts",
      },
    ],
    order_product: [
      {
        product: {
          required: true,
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          default: null,
        },
        product_code: { type: String, default: null },
        product_name: { type: String, default: null },
        delivery_price: { type: Number, default: 0 },
        sale_price: { type: Number, default: 0 },
        too: { type: Number, default: 1 },
      },
    ],
    total_price: { type: Number, default: 0 },
    total_sale_price: { type: Number, default: 0 },
    delivery_total_price: { type: Number, default: 0 },
    too: { type: Number, default: 0 },
    from_user: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Users",
      alias: "Хэнээс _id хэрэглэгчийн шилжүүлсэн жолоочийн ",
    },
    from_username: {
      type: String,
      default: null,
      alias: "Хэнээс username хэрэглэгчийн шилжүүлсэн жолоочийн ",
    },
    from_date: { type: Date, default: null },

    jolooch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      alias: "Жолоочийн  _id хэрэглэгчийн  ",
    },
    deliveryzone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryZones",
      alias: "Хүргэлтийн бүс  ",
    },
    jolooch_username: {
      type: String,
      default: null,
      alias: "Жолоочийн username хэрэглэгчийн  ",
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customers" },
    customer_phone: { type: String, default: null },
    isPaid: { type: Boolean, default: false },
    payment_date: { type: Date, default: null },
    payment_type: { type: String, enum: ["Бэлэн", "Дансаар", ""], default: "" },
    isCompleted: { type: Boolean, default: false },
    isToolson: { type: Boolean, default: false },
    address: { type: String, default: null },
    completedDate: { type: Date, default: null },
    completeTailbar: { type: String, default: "" },
    duureg: { type: String, default: "" },
    huleejawahudur: { type: Date, default: null },
    huleejawahtsag: { type: String, default: null },
    invoice_number: { type: String, default: "" },
    nemelt: { type: String, default: "" },
    zone: { type: String, default: "" },
    list_rank: { type: Number, default: 0 },
    status: { type: String, default: "Ноорог" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
OrderSchema.index({ order_number: 1 }, { unique: true });

const OrderModel =
  mongoose.models?.Orders || mongoose.model("Orders", OrderSchema);
export default OrderModel;
