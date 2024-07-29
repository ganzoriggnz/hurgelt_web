import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/users.model";
import bcrypt from "bcrypt";
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
        if (body.phone) {
          const check = await UserModel.find({
            _id: { $ne: new mongoose.Types.ObjectId(body.id) },
            phone: body.phone,
          });
          if (check.length > 0) {
            console.log(check);
            return res.status(201).json({
              result: false,
              message: "Утасны дугаар давхцаж байна. ",
            });
          }
        }
        if (body.password) {
          const salt = bcrypt.genSaltSync(10);
          body.password = bcrypt.hashSync(body.password, salt);
        } else {
          delete body.password;
        }
        await UserModel.updateOne(
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
