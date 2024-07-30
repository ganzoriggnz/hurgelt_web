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
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  try {
    let { body } = req.body;

    if (body) {
      await dbConnect();
      const temp = await UserModel.findOne({ username: body?.username });
      if (!temp) {
        if (body.phone) {
          const check = await UserModel.find({
            phone: body.phone,
          });
          if (check.length > 0) {
            return res.status(201).json({
              message:
                "Энэ утасны дугаар дээр хэрэглэгч үүссэн байна." +
                check[0]?.username,
            });
          }
        }
        if (body.password) {
          const salt = bcrypt.genSaltSync(10);
          body.password = bcrypt.hashSync(body.password, salt);
        }
        body.name = body?.name ?? body.username;
        const data = await UserModel.create(body);
        res.status(200).json({ result: true, message: "Success", data });
      } else
        res
          .status(201)
          .json({ result: false, message: "Нэвтрэх нэр давхцаж байна!!!" });
    }
  } catch (e) {
    console.log("api/users/register::ERROR:", e);
    res.status(400).json({ message: e });
  }
}
