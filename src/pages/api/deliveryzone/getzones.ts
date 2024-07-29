import dbConnect, { rgx } from "@/lib/dbConnect";
import DeliveryZoneModel from "@/models/deliveryzones.model";
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
    const { offset, limit, sort, search }: any = req.body;
    const searchRgx = rgx(search ?? "");
    const where = {
      $or: [
        { duureg: { $regex: searchRgx, $options: "i" } },
        { zone: { $regex: searchRgx, $options: "i" } },
      ],
    };
    await dbConnect();
    const totalcnt = (await DeliveryZoneModel.countDocuments(where)) ?? 0;
    const data = await DeliveryZoneModel.find(where, {
      _id: 1,
      zone: 1,
      user: 1,
      duureg: 1,
    })
      .populate([
        {
          path: "user",
          model: UserModel,
          select: {
            _id: 1,
            username: 1,
            name: 1,
            phone: 1,
            phone2: 1,
            isActive: 1,
          },
        },
      ])
      .limit(limit ?? 30)
      .skip(offset)
      .sort(sort ?? { created_at: -1 });
    res.status(200).json({ result: true, message: "Success", data, totalcnt });
  } catch (e) {
    console.log("getUsers::ERROR:", e);
    res.status(400).json({ message: e });
  }
}
