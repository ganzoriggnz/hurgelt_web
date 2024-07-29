import { IInvoiceProducts } from "@/types/next";
import mongoose from "mongoose";

const Schema = mongoose.Schema;
const invoiceProductsSchema = new Schema<IInvoiceProducts>(
  {
    invoice_number: { required: true, type: String, default: null },
    owner: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
    type: { type: String, default: null },
    product: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      default: null,
    },
    product_code: { type: String, default: null },
    product_name: { type: String, default: null },
    price: { type: Number, default: 0 },
    sale_price: { type: Number, default: 0 },
    too: { type: Number, default: 1 },
    isDeleted: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const InvoiceProductsModel =
  mongoose.models?.InvoicesProducts ||
  mongoose.model("InvoicesProducts", invoiceProductsSchema);
export default InvoiceProductsModel;
