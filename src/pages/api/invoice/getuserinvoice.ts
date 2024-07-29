import dbConnect from "@/lib/dbConnect";
import InvoiceModel from "@/models/invoices.model";
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
    res
      .status(405)
      .send({ result: false, message: "Only POST requests allowed" });
    return;
  }
  try {
    const { jolooch, offset, limit, sort, start, end }: any = req.body;
    console.log("getuserinvoice :::: ", req.body);
    if (!jolooch) {
      res
        .status(201)
        .send({ result: false, message: "Жолоочын мэдээлэл байхгүй байна!!!" });
      return;
    }
    const where: any = {
      $or: [
        { to_user: new mongoose.Types.ObjectId(jolooch) },
        { from_user: new mongoose.Types.ObjectId(jolooch) },
      ],
    };
    if (start && end) {
      where.created_at = {
        $gte: dayjs(start),
        $lt: dayjs(end),
      };
    }
    await dbConnect();
    const totalcnt = (await InvoiceModel.countDocuments(where)) ?? 0;
    const data = await InvoiceModel.find(where)
      .populate([
        {
          path: "owner",
          model: UserModel,
        },
        {
          path: "from_user",
          model: UserModel,
        },
        {
          path: "to_user",
          model: UserModel,
        },
      ])
      .limit(limit ?? 30)
      .skip(offset ?? 0)
      .sort(sort ?? { created_at: -1 });
    res.status(200).json({ result: true, message: "Success", data, totalcnt });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
