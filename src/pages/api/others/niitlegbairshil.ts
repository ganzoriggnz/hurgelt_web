import dbConnect from "@/lib/dbConnect";
import CustomerModel from "@/models/customers.model";
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
  try {
    const { id } = req.query;
    await dbConnect();
    const data =
      (await CustomerModel.aggregate([
        {
          $match: id && id != undefined ? { duureg: id } : {},
        },
        {
          $group: { _id: "$niitleg_bairshil" },
        },
      ])) ?? [];
    res
      .status(200)
      .json({ data: data?.map((item: { _id: string }) => item?._id) });
  } catch (e) {
    res.status(400).json(e);
  }
}
