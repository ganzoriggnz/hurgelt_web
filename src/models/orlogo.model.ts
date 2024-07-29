import { IOrlogo } from "@/types/next";
import mongoose from "mongoose";

const Schema = mongoose.Schema;
const OrlogosSchema = new Schema<IOrlogo>(
  {
    jolooch: {
      required: false,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    jolooch_username: {
      type: String,
      default: "",
    },
    mungu: {
      type: Number,
      default: 0,
    },
    tushaasan_date: {
      type: Date,
      default: new Date(),
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
const OrlogoModel =
  mongoose.models?.Orlogos || mongoose.model("Orlogos", OrlogosSchema);
export default OrlogoModel;
