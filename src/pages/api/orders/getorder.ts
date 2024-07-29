import dbConnect from "@/lib/dbConnect";
import CustomerModel from "@/models/customers.model";
import DeliveryZoneModel from "@/models/deliveryzones.model";
import OrderModel from "@/models/orders.model";
import OrderProductsModel from "@/models/orders_products.model";
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
    const { id }: any = req.body;

    await dbConnect();
    const data = await OrderModel.findById(id).populate([
      {
        path: "order_products",
        model: OrderProductsModel,
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
        path: "deliveryzone",
        model: DeliveryZoneModel,
        select: { _id: 1, zone: 1, user: 1, duureg: 1 },
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
    ]);

    res.status(200).json({ result: true, message: "Success", data });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ message: e });
  }
}
