import dbConnect from "@/lib/dbConnect";
import CustomerModel from "@/models/customers.model";
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
      const temp = await CustomerModel.findOne({ phone: body?.phone });
      if (!temp) {
        await CustomerModel.create(body);
        res.status(200).json({ result: true, message: "Success" });
      } else
        res
          .status(201)
          .json({ result: false, message: "Утасны дугаар давцаж байна!!!" });
    }
  } catch (e) {
    console.log("api/users/register::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
