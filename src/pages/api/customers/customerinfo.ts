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
    const { id, phone }: any = req.body;
    const where = {
      $or: [{ _id: id }, { phone: phone }],
    };
    await dbConnect();
    const data = await CustomerModel.findOne(where);
    //TODO orders ийг хийх үедээ нэмэж оруулах харгалзах захиалгуудыг
    res
      .status(200)
      .json({ result: true, message: "Success", user: data, orders: [] });
  } catch (e) {
    console.log("customerinfo::ERROR:", e);
    res.status(400).json({ message: e });
  }
}
