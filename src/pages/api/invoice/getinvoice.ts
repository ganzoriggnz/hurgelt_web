import dbConnect from "@/lib/dbConnect";
import InvoiceModel from "@/models/invoices.model";
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
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  try {
    const { id }: any = req.body;

    await dbConnect();
    const data = await InvoiceModel.findById(id).populate([
      {
        path: "owner",
        model: UserModel,
      },
      {
        path: "from_user",
        model: UserModel,
      },
      {
        path: "to_user",
        model: UserModel,
      },
    ]);
    if (data) res.status(200).json({ result: true, message: "Success", data });
    else res.status(200).json({ result: false, message: "Success" });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ message: e });
  }
}
