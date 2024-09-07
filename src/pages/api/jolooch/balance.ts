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
    const { jolooch, offset, limit, sort, search }: any = req.body;
    const searchRgx = rgx(search);
    console.log("balance :::: ", req.body);

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
    if (jolooch && jolooch == "isBugd") {
      console.log("isbugd====>");
      const totalcnt = 0;
      const data = await UserBalancesModel.aggregate([
        {
          $group: {
            _id: "$product",
            orlogodson: { $sum: "$orlogodson" },
            zarlagadsan: { $sum: "$zarlagadsan" },
            hurgegdsen: { $sum: "$hurgegdsen" },
            uldsen: { $sum: "$uldsen" },
          },
        },
        { $sort: { uldsen: 1 } },
      ]);
      await ProductModel.populate(data, {
        path: "_id",
        select: { _id: 1, price: 1, code: 1, name: 1, delivery_price: 1 },
      });
      res.status(200).json({
        result: true,
        message: "Success",
        data,
        totalcnt: data.length,
      });
    } else {
      let where = {
        owner: new mongoose.Types.ObjectId(jolooch),
        $or: [
          { product_name: { $regex: searchRgx, $options: "i" } },
          { product_code: { $regex: searchRgx, $options: "i" } },
        ],
      };
      const totalcnt = (await UserBalancesModel.countDocuments(where)) ?? 0;
      const data = await UserBalancesModel.find(where)
        .populate([
          {
            path: "product",
            model: ProductModel,
          },
        ])
        .limit(limit ?? 150)
        .skip(offset)
        .sort(sort ?? { product_name: 1 });
      res
        .status(200)
        .json({ result: true, message: "Success", data, totalcnt });
    }
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
