import dbConnect, { rgx } from "@/lib/dbConnect";
import CustomerModel from "@/models/customers.model";
import OrderModel from "@/models/orders.model";
import ProductModel from "@/models/products.model";
import UserModel from "@/models/users.model";
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
    const { offset, limit, sort, search, start, end, phone, isCompleted }: any =
      req.body;
    const searchRgx = rgx(search ?? "");
    const where: any = {
      customer_phone: phone,
      $or: [
        { order_number: { $regex: searchRgx, $options: "i" } },
        { type: { $regex: searchRgx, $options: "i" } },
      ],
    };
    if (isCompleted != null) {
      where.isCompleted = isCompleted;
    }

    await dbConnect();
    const totalcnt = (await OrderModel.countDocuments(where)) ?? 0;
    const totalcum = await OrderModel.aggregate([
      {
        $match: where,
      },
      {
        $group: {
          _id: null,
          sum: { $sum: { $multiply: ["$total_price"] } },
        },
      },
      { $sort: { totalSaleAmount: -1 } },
    ]);
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
      .limit(limit ?? 30)
      .skip(offset)
      .sort(sort ?? { created_at: -1 });
    res.status(200).json({
      result: true,
      message: "Success",
      data,
      totalcnt,
      totalcum: totalcum?.length > 0 ? totalcum[0]?.sum : 0,
    });
  } catch (e) {
    console.log("customer orders::ERROR:", e);
    res.status(400).json({ message: e });
  }
}
