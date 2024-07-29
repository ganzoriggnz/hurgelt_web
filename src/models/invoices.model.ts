import { IInvoice } from "@/types/next";
import mongoose from "mongoose";

const Schema = mongoose.Schema;
const invoiceSchema = new Schema<IInvoice>(
  {
    invoice_number: {
      required: true,
      type: String,
      default: null,
      unigue: true,
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    owner_name: { type: String, default: null },
    type: { type: String, default: null, alias: "Агуулах | Борлуулалт" },
    invoice_products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InvoicesProducts",
      },
    ],
    invoice_product: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
        product_code: { type: String, default: null },
        product_name: { type: String, default: null },
        price: { type: Number, default: 0 },
        sale_price: { type: Number, default: 0 },
        too: { type: Number, default: 1 },
      },
    ],
    total_price: { type: Number, default: 0 },
    too: { type: Number, default: 0 },
    from_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      alias: "Хэнээс _id хэрэглэгчийн  ",
    },
    from_username: {
      type: String,
      default: null,
      alias: "Хэнээс username хэрэглэгчийн  ",
    },
    to_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      alias: "Хэнд  _id хэрэглэгчийн  ",
    },
    to_username: {
      type: String,
      default: null,
      alias: "Хэнд  username хэрэглэгчийн  ",
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customers" },
    customer_phone: { type: String, default: null },
    customer_name: { type: String, default: null },
    isPaid: {
      type: String,
      default: "",
      alias: "Ноорог эсвэл нөөц, орлого, зарлага, акт  ",
    },
    payment_date: { type: String, default: null },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
invoiceSchema.index({ invoice_number: 1 }, { unique: true });

const InvoiceModel =
  mongoose.models?.Invoices || mongoose.model("Invoices", invoiceSchema);
export default InvoiceModel;
