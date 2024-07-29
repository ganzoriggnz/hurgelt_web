import UserModel from "@/models/users.model";
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
    const { title, body, users } = req.body;
    let device_tokens: any[] = [];
    device_tokens = await UserModel.find({
      $and: [
        users ? { username: { $in: users ?? [] } } : {},
        { device_token: { $ne: null } },
      ],
    }).select({ device_token: 1, _id: 0, username: 1 });

    res
      .status(200)
      .json({ result: true, message: "success", data: device_tokens });
  } catch (error) {
    res.status(400).json(error);
  }
}
