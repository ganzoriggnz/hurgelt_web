import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/users.model";
import jwt from "jsonwebtoken";
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
      let { id, location } = req.body;
      console.log(id, location);
      await dbConnect();
      const token =
        (req?.cookies?.accessToken as string) ??
        req.headers?.authorization?.split("Bearer ").at(1)?.toString();
      const clientData: any = jwt.decode(token);
      const clidcheck = await UserModel.findOne({
        username: clientData?.user?.username,
        isActive: true,
      });
      if (!clidcheck) {
        return res.status(401).json({
          result: false,
          message: "Байхгүй эсвэл идвэхгүй хэрэглэгч байна !!!",
        });
      }
      if (id && location) {
        const user = await UserModel.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(id) },
          {
            location: location,
          },
          { new: true }
        );
        if (user) user.password = "";
        res.status(200).json({
          result: true,
          message: "Амжилттай хадгалсан.",
          user,
        });
      } else {
        res
          .status(200)
          .json({ result: false, message: "Амжилтгүй хадгалсан." });
      }
    } catch (error) {
      res.status(400).json({ result: false, message: error });
    }
}
