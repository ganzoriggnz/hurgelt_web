import { IUserBalances } from "@/types/next";
import mongoose from "mongoose";

const Schema = mongoose.Schema;
const userBalancesSchema = new Schema<IUserBalances>(
  {
    owner: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
    username: {
      type: String,
      default: null,
    },
    product: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      default: null,
    },
    product_code: { type: String, default: null },
    product_name: { type: String, default: null },

    orlogodson: { type: Number, default: 0 },
    zarlagadsan: { type: Number, default: 0 },
    hurgegdsen: { type: Number, default: 0 },
    uldsen: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

userBalancesSchema.index({ owner: 1, product: 1 }, { unique: true });

const UserBalancesModel =
  mongoose.models?.Userbalances ||
  mongoose.model("Userbalances", userBalancesSchema);
export default UserBalancesModel;
