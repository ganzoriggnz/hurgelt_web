import { ICustomer } from "@/types/next";
import mongoose from "mongoose";

const Schema = mongoose.Schema;
const userSchema = new Schema<ICustomer>(
  {
    phone: {
      required: true,
      type: String,
    },
    address: {
      type: String,
      default: "",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
userSchema.index({ phone: 1 }, { unique: true });

const CustomerModel =
  mongoose.models?.Customers || mongoose.model("Customers", userSchema);
export default CustomerModel;
