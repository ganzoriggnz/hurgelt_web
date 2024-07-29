import mongoose from "mongoose";

const Schema = mongoose.Schema;
const logsSchema = new Schema<{
  log: string;
  path: string;
  query: string;
  body: Object;
  method: string;
  key: string;
  data: Object;
  olddata: Object;
}>(
  {
    log: {
      type: String,
      default: "",
    },
    method: {
      type: String,
      default: "",
    },
    query: {
      type: String,
      default: "",
    },
    body: {
      type: Object,
      default: null,
    },
    key: {
      type: String,
      default: "",
    },
    path: {
      type: String,
      default: "/",
    },
    data: {
      type: Object,
      default: null,
    },
    olddata: {
      type: Object,
      default: null,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);
const LogModel = mongoose.models?.Logs || mongoose.model("Logs", logsSchema);
export default LogModel;
