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
  try {
    const { id } = req.body;
    console.log(req.body);
    await dbConnect();
    await OrderModel.findByIdAndUpdate(id, {
      isPaid: true,
    });
    return res.status(200).json({ result: true, message: "Success" });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
}
