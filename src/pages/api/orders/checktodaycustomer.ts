import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/models/orders.model";
import OrderProductsModel from "@/models/orders_products.model";
import type { NextApiRequest, NextApiResponse } from "next";
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
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  try {
    const { phone }: any = req.body;
    await dbConnect();
    const now = new Date();
    const data = await OrderModel.findOne({
      customer_phone: phone,

      created_at: {
        $gte: now.setDate(now.getDate() - 1),
        $lt: new Date(),
      },
    })
      .populate([
        {
          path: "order_products",
          model: OrderProductsModel,
        },
      ])
      .sort({ created_at: -1 });
    console.log(data);
    if (data) res.status(200).json({ result: true, message: "Success", data });
    else res.status(200).json({ result: false, message: "Success", data });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ message: e });
  }
}
