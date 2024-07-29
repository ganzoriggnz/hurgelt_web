import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/models/orders.model";
import OrderProductsModel from "@/models/orders_products.model";
import dayjs from "dayjs";
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
    let { id, body } = req.body;
    console.log("orderfieldupdate:::::::: :", req.body);
    if (id) {
      await dbConnect();
      await OrderModel.findByIdAndUpdate(id, body);
      res.status(200).json({ result: true, message: "Success update!" });
    } else {
      res.status(200).json({ result: false, message: "id not found" });
    }
  } catch (error) {
    res.status(400).json({ result: false, message: error });
  }
}
