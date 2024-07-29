import dbConnect from "@/lib/dbConnect";
import DeliveryZoneModel from "@/models/deliveryzones.model";
import { NextApiRequest, NextApiResponse } from "next";
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
  const { id } = req.query;
  await dbConnect();
  const data =
    (await DeliveryZoneModel.aggregate([
      {
        $match: id && id != undefined ? { duureg: id } : {},
      },
      {
        $group: { _id: "$zone" },
      },
    ])) ?? [];

  res.status(200).json({
    result: true,
    data: data?.map((item: { _id: string }) => item?._id),
  });
}
