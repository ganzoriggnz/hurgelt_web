import mongoose from "mongoose";
import { IDeliveryZone } from "../types/next";

const Schema = mongoose.Schema;
const deliveryZoneSchema = new Schema<IDeliveryZone>(
  {
    user: {
      required: false,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    zone: {
      type: String,
      default: "",
    },
    duureg: {
      type: String,
      default: "",
    },
    car_mark: {
      type: String,
      default: "",
    },
    car_number: {
      type: String,
      default: "",
    },
    car_desc: {
      type: String,
      default: "",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
deliveryZoneSchema.index({});

const DeliveryZoneModel =
  mongoose.models?.DeliveryZones ||
  mongoose.model("DeliveryZones", deliveryZoneSchema);
export default DeliveryZoneModel;
