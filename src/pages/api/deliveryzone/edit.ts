import dbConnect from "@/lib/dbConnect";
import DeliveryZoneModel from "@/models/deliveryzones.model";
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
    let { body, id } = req.body;
    if (body) {
      console.log(req.body);
      await dbConnect();
      await DeliveryZoneModel.findByIdAndUpdate(id, body);
    }
    res.status(200).json({ result: true, message: "Success" });
  } catch (e) {
    console.log("api/DeliveryZone/add::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
