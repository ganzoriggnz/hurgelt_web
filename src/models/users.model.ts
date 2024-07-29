import { IUser } from "@/types/next";
import mongoose from "mongoose";

const Schema = mongoose.Schema;
const userSchema = new Schema<IUser>(
  {
    username: {
      required: true,
      type: String,
    },
    name: {
      required: false,
      type: String,
    },
    email: {
      type: String,
      default: null,
    },
    phone: {
      required: true,
      type: String,
    },
    phone2: {
      type: String,
      default: null,
    },
    password: {
      required: true,
      type: String,
      minlength: 5,
    },
    avatar: {
      type: String,
    },
    device_token: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },

    level: {
      type: Number,
      default: 3,
      enum: [0, 1, 2, 3, 4, 5],
    },
    role: {
      type: String,
      enum: [
        "супер админ",
        "админ",
        "оператор",
        "жолооч",
        "нярав",
        "харилцагч",
      ],
      default: "жолооч",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isOperator: {
      type: Boolean,
      default: false,
    },
    last_login: {
      allowNull: false,
      type: Date,
      default: new Date(),
    },
    logout_at: {
      allowNull: false,
      type: Date,
      default: new Date(),
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
userSchema.index({ username: 1, phone: 1 }, { unique: true });

const UserModel = mongoose.models?.Users || mongoose.model("Users", userSchema);
export default UserModel;
