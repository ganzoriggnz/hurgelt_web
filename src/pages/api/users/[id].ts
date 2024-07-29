import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/users.model";
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
  try {
    const { id } = req.query;

    if (!id) {
      res.status(405).send({ message: "id not found" });
      return;
    }

    await dbConnect();
    const data = await UserModel.findOne({ username: id }, { password: 0 });
    res.status(200).json({ result: true, message: "Success", data });
  } catch (e) {
    console.log("getUsers::ERROR:", e);
    res.status(400).json({ message: e });
  }
}
