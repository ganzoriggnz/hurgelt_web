import { sendNotificationfirebaseLevel } from "@/lib/firebase_func";
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
    const { title, body, level }: any = req.body;
    console.log(req.body);
    sendNotificationfirebaseLevel({
      level: [level],
      title: title,
      body: body,
      isNotif: "isNotif",
      datafile: {},
    });
    res.status(200).json({ result: true, message: "Success" });
  } catch (e) {
    console.log("api/orders/add::ERROR:", e);
    return res.status(400).json({ result: false, message: JSON.stringify(e) });
  }
}
