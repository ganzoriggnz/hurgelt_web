import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type } = req.query;
  if (type) {
    try {
      console.log("start!!!!!");
      throw new Error("Failed to Delete Process");
    } catch (e) {
      console.log("end!!!!!");
      process.exit(1);
    }
  } else {
    res.status(200).json({
      result: true,
      message: "Success",
    });
  }
}
