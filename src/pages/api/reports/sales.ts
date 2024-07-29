import dbConnect, { rgx } from "@/lib/dbConnect";
import OrderModel from "@/models/orders.model";
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
    //TODO борлуулалтын тайлан
    const { search, start, end, sort }: any = req.body;
    // console.log(req.body);
    const searchRgx = rgx(search ?? "");
    await dbConnect();

    const totalData = await OrderModel.aggregate([
      {
        $match: {
          isCompleted: true,
          status: "Хүргэгдсэн",
          completedDate: {
            $gte: new Date(start),
            $lt: new Date(end),
          },
          $or: [
            { jolooch_username: { $regex: searchRgx, $options: "i" } },
            { duureg: { $regex: searchRgx, $options: "i" } },
            { niitleg_bairshil: { $regex: searchRgx, $options: "i" } },
          ],
        },
      },
      {
        $group: {
          _id: "$jolooch_username",
          orders: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $addFields: {
          too: { $sum: "$orders.too" },
          total_price: { $sum: "$orders.total_price" },
          delivery_total_price: { $sum: "$orders.delivery_total_price" },
        },
      },

      { $sort: sort ?? { _id: -1 } },
    ]);
    // console.log(totalData);
    res.status(200).json({
      result: true,
      message: "Success",
      totalData,
    });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
