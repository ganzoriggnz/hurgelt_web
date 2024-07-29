import mongoose from "mongoose";

const { MONGODB_URI } = process.env;
const connection: any = {};
// connection function
const dbConnect = async () => {
  if (connection.isConnected) {
    console.log("re Connection!!!", MONGODB_URI as string);
    return;
  }
  const conn = await mongoose
    .connect(MONGODB_URI as string)
    .catch((err: any) => {
      console.log(err);
    });

  if (conn) connection.isConnected = true;
  console.log("Mongoose Connection Established", MONGODB_URI as string);
  return conn;
};
export const rgx = (pattern: string) => new RegExp(`.*${pattern ?? ""}.*`);
export const rgxStart = (pattern: string) => new RegExp(`${pattern ?? ""}.*`);
export default dbConnect;
