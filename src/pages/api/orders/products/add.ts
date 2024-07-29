import dbConnect from "@/lib/dbConnect";
import OrderProductsModel from "@/models/orders_products.model";
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
    const { body } = req.query;
    await dbConnect();

    const idIP = await OrderProductsModel.create({});
    //TODO: hiih zahialgiin ordert product nemeh
    // const temp = await OrderModel.findOne({
    //   _id: id ?? req.body?.id,
    // });
    // await OrderProductsModel.updateMany(
    //   {
    //     order_number: temp?.order_number,
    //   },
    //   {
    //     isDeleted: new Date(),
    //   }
    // );
    res.status(200).json({ result: true, message: "Success" });
  } catch (error) {
    res.status(400).json({ message: error });
  }
}
