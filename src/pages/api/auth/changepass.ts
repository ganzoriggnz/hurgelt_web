import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/users.model";
import bcrypt from "bcrypt";
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
  await NextCors(req, res, {
    methods: ["POST"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  try {
    const { username, password, newpassword, device_token } = req.body;
    await dbConnect();
    const user: any = await UserModel.findOne({
      $or: [{ username: username }, { phone: username }],
    });

    if (user) {
      const passwordValid = await bcrypt.compare(password, user.password);
      if (passwordValid) {
        if (newpassword) {
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(newpassword, salt);
          await UserModel.updateOne(
            {
              username: user.username,
            },
            { password: hash, device_token }
          );
        }
        res.status(200).json({ result: true, change: true, message: "Succes" });
      } else {
        res.status(200).json({
          result: true,
          change: false,
          data: null,
          message: "Нууц үг буруу байна!!!",
        });
      }
    } else {
      res.status(200).json({
        result: true,
        change: false,
        data: null,
        message: "Хэрэглэгчийн нэвтрэх нэр буруу байна!!!",
      });
    }
  } catch (e) {
    console.log("login ERROR::::::", e);
    res.status(400).json({ result: false, change: false, data: e });
  }
}
