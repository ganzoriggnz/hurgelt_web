import dbConnect from "@/lib/dbConnect";
import CustomerModel from "@/models/customers.model";
import OrderModel from "@/models/orders.model";
import ProductModel from "@/models/products.model";
import UserModel from "@/models/users.model";
import dayjs from "dayjs";
import mongoose from "mongoose";
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
    const { jolooch, offset, limit, sort, start, end }: any = req.body;
    console.log(req.body);
    let where: any = {
      jolooch: new mongoose.Types.ObjectId(jolooch),
      isCompleted: true,
      status: "Хүргэгдсэн",
      completedDate: {
        $gte: dayjs(start),
        $lt: dayjs(end),
      },
    };

    await dbConnect();
    const totalcnt = (await OrderModel.countDocuments(where)) ?? 0;
    const data = await OrderModel.find(where)
      .populate([
        {
          path: "order_product",
          populate: {
            path: "product",
            model: ProductModel,
          },
        },
        {
          path: "owner",
          model: UserModel,
          select: { password: 0 },
        },
        {
          path: "from_user",
          model: UserModel,
          select: { password: 0 },
        },
        {
          path: "jolooch",
          model: UserModel,
          select: { password: 0 },
        },
        {
          path: "customer",
          model: CustomerModel,
        },
      ])
      // .limit(limit ?? 10)
      .skip(offset)
      .sort(sort ?? { completedDate: -1 });
    res.status(200).json({ result: true, message: "Success", data, totalcnt });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
