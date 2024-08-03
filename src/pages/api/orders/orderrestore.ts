import dbConnect from "@/lib/dbConnect";
import { sendNotificationfirebase } from "@/lib/firebase_func";
import OrderModel from "@/models/orders.model";
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
    let { id } = req.body;
    console.log(req.body);

    if (id) {
      let body: any = {
        completedDate: null,
        isCompleted: false,
        isPaid: false,
        isToolson: false,
        huleejawahudur: new Date(),
        completeTailbar: "Буцааж дахин сэргээв.",
        status: "Хүргэлтэнд",
      };
      // console.log(body);
      await dbConnect();
      await OrderModel.findByIdAndUpdate(id, body);
      const order = await OrderModel.findById(id);

      sendNotificationfirebase({
        users_id: [order?.jolooch_username],
        title: `${order.owner_name}-ажилтан  (${order?.order_number})дугаартай захиалгыг дахин сэргээв.`,
        body: `Захиалагчын утас: ${
          order?.customer_phone
        }, Бараа: ${order.order_product
          .map((item: any) => {
            return `(${item.product_name}-${item.too}ш)`;
          })
          .join(", ")} `,
        isNotif: "isNotif",
        datafile: {},
      });

      return res
        .status(200)
        .json({ result: true, message: "Амжилттай хадгалсан." });
    } else {
      return res.status(200).json({ result: false, message: "id not found" });
    }
  } catch (error) {
    res.status(400).json({ result: false, message: error });
  }
}
