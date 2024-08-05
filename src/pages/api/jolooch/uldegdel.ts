import dbConnect, { rgx } from "@/lib/dbConnect";
import OrderModel from "@/models/orders.model";
import ProductModel from "@/models/products.model";
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
    Headers: ["Authorization", "Content-Type", "ULDEGDEL"],
    optionsSuccessStatus: 200,
  });
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  try {
    const { start, end, search, jolooch }: any = req.body;
    console.log(req.body);

    const searchRgx = rgx(search ?? "");

    await dbConnect();
    const productData = await ProductModel.find(
      {
        $or: [
          {
            code: { $regex: searchRgx, $options: "i" },
          },
          {
            name: { $regex: searchRgx, $options: "i" },
          },
        ],
      },
      {
        __v: 0,
        balance: 0,
        created_at: 0,
        updated_at: 0,
        tailbar: 0,
        image: 0,
        total_price: 0,
      }
    );

    let where: any = {
      isCompleted: true,
      jolooch: new mongoose.Types.ObjectId(jolooch),
      status: "Хүргэгдсэн",
      completedDate: {
        $gte: new Date(start),
        $lt: new Date(end),
      },
    };
    const borluulagdsan = await OrderModel.find(where, {
     order_product: 1
    });
    var borlogdsonZahialga: any[] = [];
    borluulagdsan.forEach((element) => {
      borlogdsonZahialga = borlogdsonZahialga.concat(element.order_product);
    });
    var newlist: any[] = [];
    for (let index = 0; index < productData.length; index++) {
      const element = productData[index];
      const temp: any = JSON.parse(JSON.stringify(element));
      temp.hurgegdsen =
        borlogdsonZahialga
          .filter((e) => e?.product == element.id)
          .reduce((a: number, b: any) => {
            return a + b.too;
          }, 0) ?? 0;
      temp.key = index;
      if (temp.hurgegdsen > 0) newlist.push(temp);
    }

    res.status(200).json({
      result: true,
      message: "Success",
      data: newlist.sort((a, b) => b?.hurgegdsen - a?.hurgegdsen),
    });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
