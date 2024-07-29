import dbConnect, { rgx } from "@/lib/dbConnect";
import CustomerModel from "@/models/customers.model";
import DeliveryZoneModel from "@/models/deliveryzones.model";
import OrderModel from "@/models/orders.model";
import OrderProductsModel from "@/models/orders_products.model";
import ProductModel from "@/models/products.model";
import UserModel from "@/models/users.model";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
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
    const { status, offset, limit, sort, search, start, end }: any = req.body;
    console.log(req.body);
    console.log(req);
    const searchRgx = rgx(search ?? "");
    let where: any = {
      isCompleted: status,
      $or: [
        { order_number: { $regex: searchRgx, $options: "i" } },
        { type: { $regex: searchRgx, $options: "i" } },
        { customer_phone: { $regex: searchRgx, $options: "i" } },
        { customer_name: { $regex: searchRgx, $options: "i" } },
        { duureg: { $regex: searchRgx, $options: "i" } },
        { niitleg_bairshil: { $regex: searchRgx, $options: "i" } },
      ],
    };
    if (status) {
      where.completedDate = {
        $gte: dayjs(start),
        $lt: dayjs(end),
      };
    } else {
      where.huleejawahudur = {
        $gte: dayjs(start),
        $lt: dayjs(end),
      };
    }
    await dbConnect();
    const token =
      (req?.cookies?.accessToken as string) ??
      req.headers?.authorization?.split("Bearer ").at(1)?.toString();
    const clientData: any = jwt.decode(token);
    const clidcheck = await UserModel.findOne({
      username: clientData?.user?.username,
      isActive: true,
    });
    if (!clidcheck) {
      return res.status(401).json({
        result: false,
        message: "Байхгүй эсвэл идвэхгүй хэрэглэгч байна !!!",
      });
    }
    const totalcnt = (await OrderModel.countDocuments(where)) ?? 0;
    const totalcum = await OrderModel.aggregate([
      {
        $match: where,
      },
      {
        $group: {
          _id: null,
          sum: { $sum: { $multiply: ["$total_price"] } },
          delivery: { $sum: { $multiply: ["$delivery_total_price"] } },
        },
      },
      { $sort: { totalSaleAmount: -1 } },
    ]);
    const data = await OrderModel.find(where, { __v: 0 })
      .populate([
        {
          path: "order_products",
          model: OrderProductsModel,
          populate: {
            path: "product",
            model: ProductModel,
          },
        },
        {
          path: "deliveryzone",
          model: DeliveryZoneModel,
          select: { __v: 0, created_at: 0, updated_at: 0 },
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
          select: {
            password: 0,
            location: 0,
            device_token: 0,
            isActive: 0,
            last_login: 0,
            logout_at: 0,
            avatar: 0,
            __v: 0,
            created_at: 0,
            updated_at: 0,
          },
        },
        {
          path: "from_user",
          model: UserModel,
          select: {
            password: 0,
            location: 0,
            device_token: 0,
            isActive: 0,
            last_login: 0,
            logout_at: 0,
            avatar: 0,
            __v: 0,
            created_at: 0,
            updated_at: 0,
          },
        },
        {
          path: "jolooch",
          model: UserModel,
          select: {
            password: 0,
            location: 0,
            device_token: 0,
            isActive: 0,
            last_login: 0,
            logout_at: 0,
            avatar: 0,
            __v: 0,
            created_at: 0,
            updated_at: 0,
          },
        },
        {
          path: "customer",
          model: CustomerModel,
          select: { created_at: 0, updated_at: 0, __v: 0 },
        },
      ])
      .limit(limit ?? 30)
      .skip(offset)
      .sort(sort ?? { created_at: -1 });

    // console.log(data);
    res.status(200).json({
      result: true,
      message: "Success",
      data,
      totalcnt,
      totalcum: totalcum?.length > 0 ? totalcum[0]?.sum : 0,
      delivery: totalcum?.length > 0 ? totalcum[0]?.delivery : 0,
    });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
