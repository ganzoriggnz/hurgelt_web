import dbConnect, { rgx } from "@/lib/dbConnect";
import CustomerModel from "@/models/customers.model";
import DeliveryZoneModel from "@/models/deliveryzones.model";
import OrderModel from "@/models/orders.model";
import OrderProductsModel from "@/models/orders_products.model";
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
    const {
      status,
      isCompleted,
      jolooch,
      offset,
      limit,
      sort,
      search,
      start,
      end,
    }: any = req.body;
    console.log(req.body);
    const searchRgx = rgx(search ?? "");
    let where: any = {
      jolooch: new mongoose.Types.ObjectId(jolooch),
      // $or: [
      //   { order_number: { $regex: searchRgx, $options: "i" } },
      //   { customer_phone: { $regex: searchRgx, $options: "i" } },
      //   { duureg: { $regex: searchRgx, $options: "i" } },
      // ],
    };
    if (isCompleted == null) {
      where.created_at = {
        $gte: dayjs(start),
        $lt: dayjs(end),
      };
    } else {
      where.isCompleted = isCompleted;
      where.completedDate = {
        $gte: dayjs(start),
        $lt: dayjs(end),
      };
    }
    if (status != null && status != "") {
      where.status = status;
    }
    await dbConnect();
    if (search != null && search.length > 0) {
      const kk = await OrderProductsModel.find(
        {
          //TODO :::
          // jolooch: new mongoose.Types.ObjectId(jolooch),
          $or: [
            {
              product_name: { $regex: searchRgx, $options: "i" },
            },
            {
              product_code: { $regex: searchRgx, $options: "i" },
            },
          ],
        },
        { select: { _id: 1 } }
      );
      delete where["completedDate"];
      delete where.created_at;
      const tempddd: string[] = kk.map((e) => e?._id) ?? [];
      where.order_products = {
        $in: tempddd,
      };
    }
    const totalcnt = (await OrderModel.countDocuments(where)) ?? 0;
    const totalcum = await OrderModel.aggregate([
      {
        $match: where,
      },
      {
        $group: {
          _id: { status: "$status", orderSum: "$orderCount" },
          orderCount: { $sum: 1 },
          too: { $sum: "$$ROOT.too" },
          sum: { $sum: { $multiply: ["$total_price"] } },
          delivery: { $sum: { $multiply: ["$delivery_total_price"] } },
        },
      },
      { $sort: { orderCount: 1 } },
    ]);

    const data = await OrderModel.find(where)
      .populate([
        {
          path: "order_products",
          model: OrderProductsModel,
          // match: {
          //   $or: [
          //     {
          //       product_name: { $regex: searchRgx, $options: "i" },
          //     },
          //     {
          //       product_code: { $regex: searchRgx, $options: "i" },
          //     },
          //   ],
          // },
          populate: {
            path: "product",
            model: ProductModel,
          },
        },
        {
          path: "deliveryzone",
          model: DeliveryZoneModel,
          populate: {
            path: "user",
            model: UserModel,
            select: {
              _id: 1,
              username: 1,
              name: 1,
              phone: 1,
              phone2: 1,
            },
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
      // .limit(limit ?? 30)
      .skip(offset)
      .sort(sort ?? { created_at: -1 });
    // .then((datas) =>
    //   datas.filter(
    //     (item) =>
    //       item?.order_products != null && item?.order_products?.length > 0
    //   )
    // );

    res.status(200).json({
      result: true,
      message: "Success",
      data,
      totalcnt,
      totalcum,
    });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
