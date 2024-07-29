import dbConnect from "@/lib/dbConnect";
import UserBalancesModel from "@/models/usersbalance.model";
import mongoose from "mongoose";
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
  console.log(req.body);

  if (req.method !== "POST") {
    return res
      .status(405)
      .send({ result: false, message: "Only POST requests allowed" });
  } else
    try {
      let { body } = req.body;
      await dbConnect();
      if (body) {
        await UserBalancesModel.updateOne(
          { _id: new mongoose.Types.ObjectId(body.id) },
          body
        );
        res.status(200).json({ result: true, message: "Амжилттай хадгалсан." });
      } else {
        res
          .status(200)
          .json({ result: false, message: "Амжилтгүй хадгалсан." });
      }
    } catch (error) {
      res.status(400).json({ result: false, message: error });
    }
}
