import dbConnect, { rgx } from "@/lib/dbConnect";
import CustomerModel from "@/models/customers.model";
import OrderModel from "@/models/orders.model";
import ProductModel from "@/models/products.model";
import UserModel from "@/models/users.model";
import jwt from "jsonwebtoken";
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
      offset,
      limit,
      sort,
      search,
      start,
      end,
      user,
      isCompleted,
      owner,
      jolooch,
      product,
    }: any = req.body;
    console.log(req.body);
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
    const searchRgx = rgx(search);
    const where: any = {
      $or: [
        { order_number: { $regex: searchRgx, $options: "i" } },
        { customer_phone: { $regex: searchRgx, $options: "i" } },
        { duureg: { $regex: searchRgx, $options: "i" } },
        { jolooch_username: { $regex: searchRgx, $options: "i" } },
      ],
    };
    if (user && user?.length > 0) {
      where.owner_name = user;
    }
    if (isCompleted != null) {
      where.isCompleted = isCompleted;
      if (isCompleted == true) {
        where.completedDate = {
          $gte: new Date(start),
          $lt: new Date(end),
        };
      } else {
        where.created_at = {
          $gte: new Date(start),
          $lt: new Date(end),
        };
      }
    } else {
      where.created_at = {
        $gte: new Date(start),
        $lt: new Date(end),
      };
    }
    if (owner && owner?.length > 0) {
      where.owner = { $in: owner };
    }
    if (jolooch && jolooch?.length > 0) {
      where.jolooch = { $in: jolooch };
    }
    if (product && product?.length > 0) {
      where.order_product = {
        $elemMatch: {
          product: {
            $in:
              product.map(
                (item: string) => new mongoose.Types.ObjectId(item)
              ) ?? [],
          },
        },
      };
    }

    if (status != null && status?.length > 0) {
      where.status = { $in: status };
    }
    console.log(where);
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
      .limit(limit ?? 30)
      .skip(offset)
      .sort(sort ?? { created_at: -1 });
    res.status(200).json({ result: true, message: "Success", data, totalcnt });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
