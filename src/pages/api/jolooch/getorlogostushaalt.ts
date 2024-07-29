import dbConnect from "@/lib/dbConnect";
import OrlogoModel from "@/models/orlogo.model";
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
    const { jolooch_username, offset, limit, sort, start, end }: any = req.body;
    console.log(req.body);
    const where: any = {
      jolooch_username: jolooch_username,
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
    const data = await OrlogoModel.find(where, {
      mungu: 1,
      created_at: 1,
      tushaasan_date: 1,
      note: 1,
    })
      .limit(limit ?? 30)
      .skip(offset)
      .sort(sort ?? { tushaasan_date: -1 });
    res.status(200).json({
      result: true,
      message: "Success",
      data,
      totalcnt,
      totalcum: totalcum.length > 0 ? totalcum[0] : {},
    });
  } catch (e) {
    console.log("getUsers::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
