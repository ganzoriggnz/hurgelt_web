import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/models/orders.model";
import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    origin: "*",
    Headers: ["Authorization", "Content-Type"],
    optionsSuccessStatus: 200,
  });
  if (req.method !== "POST") {
    res
      .status(405)
      .send({ result: false, message: "Only POST requests allowed" });
    return;
  }
  try {
    const { uid1, rank1, uid2, rank2 } = req.body;
    if (uid1 & rank1 & uid2 & rank2) {
      await dbConnect();
      await OrderModel.findByIdAndUpdate(uid1, { listrank: rank1 });
      await OrderModel.findByIdAndUpdate(uid2, { listrank: rank2 });
      res.status(200).json({ result: true, message: "Success" });
    }
    res.status(200).json({ result: true, message: "Success" });
  } catch (error) {
    res.status(400).json({ result: false, message: error });
  }
}
