import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/users.model";
import UserBalancesModel from "@/models/usersbalance.model";
import jwt from "jsonwebtoken";
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
    Headers: ["Authorization", "Content-Type", "ULDEGDEL"],
    optionsSuccessStatus: 200,
  });
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }

  const token =
    (req?.cookies?.accessToken as string) ??
    req.headers?.authorization?.split("Bearer ").at(1)?.toString();
  const clientData: any = jwt.decode(token);
  const clidcheck = await UserModel.findOne({
    username: clientData?.user?.username,
    isActive: true,
    level: { $in: [0, 1] },
  });
  if (!clidcheck) {
    return res.status(401).json({
      result: false,
      message:
        "Байхгүй эсвэл идвэхгүй хэрэглэгч байна эсвэл Эрх хүрэхгүй байна. !!!",
    });
  }

  try {
    const { jolooch }: any = req.body;
    console.log(req.body);

    await dbConnect();
    await UserBalancesModel.deleteMany({
      owner: new mongoose.Types.ObjectId(jolooch),
    });
    res.status(200).json({
      result: true,
      message: "Success",
    });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
