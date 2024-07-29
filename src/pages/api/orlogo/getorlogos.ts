import dbConnect, { rgx } from "@/lib/dbConnect";
import OrlogoModel from "@/models/orlogo.model";
import UserModel from "@/models/users.model";
import dayjs from "dayjs";
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
    const { offset, limit, sort, search, start, end }: any = req.body;
    const searchRgx = rgx(search ?? "");
    const where: any = {
      $or: [
        { jolooch_username: { $regex: searchRgx, $options: "i" } },
        { note: { $regex: searchRgx, $options: "i" } },
      ],
    };
    if (start && end) {
      where.tushaasan_date = {
        $gte: dayjs(start),
        $lt: dayjs(end),
      };
    }

    await dbConnect();
    const totalcnt = (await OrlogoModel.countDocuments(where)) ?? 0;
    const totalcum = await OrlogoModel.aggregate([
      {
        $match: where,
      },
      {
        $group: {
          _id: null,
          sum: { $sum: { $multiply: ["$mungu"] } },
          avg: { $avg: "$mungu" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalSaleAmount: -1 } },
    ]);
    console.log(totalcum);
    const data = await OrlogoModel.find(where)
      .populate([
        {
          path: "jolooch",
          model: UserModel,
          select: {
            _id: 1,
            username: 1,
            name: 1,
            phone: 1,
            phone2: 1,
          },
        },
      ])
      .limit(limit ?? 30)
      .skip(offset)
      .sort(sort ?? { created_at: -1 });
    res.status(200).json({
      message: "Success",
      data,
      totalcnt,
      totalcum: totalcum.length > 0 ? totalcum[0] : {},
    });
  } catch (e) {
    console.log("getUsers::ERROR:", e);
    res.status(400).json({ message: e });
  }
}
