import dbConnect, { rgx } from "@/lib/dbConnect";
import ProductModel from "@/models/products.model";
import UserModel from "@/models/users.model";
import UserBalancesModel from "@/models/usersbalance.model";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    origin: "*",
    Headers: ["Authorization", "Content-Type"],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    optionsSuccessStatus: 200,
  });
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  try {
    const { prodId, offset, limit, sort, search }: any = req.body;
    const searchRgx = rgx(search);
    console.log("balance :::: ", req.body);

    let where = {
      product: new mongoose.Types.ObjectId(prodId),
      $or: [
        { product_name: { $regex: searchRgx, $options: "i" } },
        { product_code: { $regex: searchRgx, $options: "i" } },
      ],
    };

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
    const totalcnt = (await UserBalancesModel.countDocuments(where)) ?? 0;
    const data = await UserBalancesModel.find(where)
      .populate([
        {
          path: "owner",
          model: UserModel,
        },
        {
          path: "product",
          model: ProductModel,
        },
      ])
      .limit(limit ?? 150)
      .skip(offset)
      .sort(sort ?? { product_name: 1 });
    res.status(200).json({ result: true, message: "Success", data, totalcnt });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
