import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/models/orders.model";
import ProductModel from "@/models/products.model";
import UserBalancesModel from "@/models/usersbalance.model";
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
    const { id, start, end }: any = req.body;
    console.log(req.body);
    let where: any = {
      jolooch: new mongoose.Types.ObjectId(id),
      isCompleted: false,
      status: "Хүргэлтэнд",
      huleejawahudur: {
        $gte: dayjs(start),
        $lt: dayjs(end),
      },
    };
    await dbConnect();
    const uldegdel = await UserBalancesModel.find({
      owner: new mongoose.Types.ObjectId(id),
    });

    const totalcnt = (await OrderModel.countDocuments(where)) ?? 0;
    const data = await OrderModel.find(where, {
      order_products: 1,
    })
      .populate([
        {
          path: "$order_products.product",
          model: ProductModel,
          select: { _id: 1, code: 1, name: 1 },
        },
      ])
      .sort({ created_at: 1 });

    var borlogdsonZahialga: any[] = [];
    data.forEach((element) => {
      borlogdsonZahialga = borlogdsonZahialga.concat(element.order_products);
    });

    var newlist: any[] = [];
    for (let index = 0; index < borlogdsonZahialga.length; index++) {
      const element = borlogdsonZahialga[index];
      const temp: any = JSON.parse(JSON.stringify(element));

      const indexfind = newlist.findIndex(
        (e) => e.product_code == temp?.product_code
      );

      if (indexfind < 0) {
        const lkk = uldegdel.findLast(
          (a: any) => a?.product_code == temp?.product_code
        );
        temp.uldegel = lkk
          ? lkk?.orlogodson - lkk?.hurgegdsen - lkk?.zarlagadsan
          : 0;
        newlist.push(temp);
      } else {
        newlist[indexfind].too = newlist[indexfind].too + temp.too;
      }
    }

    res.status(200).json({
      result: true,
      message: "Success",
      data: newlist,
      totalcnt,
    });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
