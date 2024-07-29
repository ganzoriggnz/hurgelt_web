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
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  try {
    let { body } = req.body;
    await dbConnect();
    if (body) {
      await CustomerModel.updateOne({ _id: body.id }, body);
      res.status(200).json({ result: true, message: "Success" });
    }
  } catch (error) {
    res.status(400).json({ result: false, message: error });
  }
}
