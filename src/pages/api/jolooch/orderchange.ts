import dbConnect from "@/lib/dbConnect";
import { sendNotificationfirebase } from "@/lib/firebase_func";
import OrderModel from "@/models/orders.model";
import OrderProductsModel from "@/models/orders_products.model";
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
    let {
      id,
      jolooch_id,
      jolooch_username,
      from_jolooch_id,
      form_jolooch_username,
      deliveryzone,
    } = req.body;
    console.log(req.body);
    await dbConnect();
    if (id && jolooch_id && jolooch_username && deliveryzone) {
      await OrderModel.findByIdAndUpdate(id, {
        from_user: from_jolooch_id.length > 0 ? from_jolooch_id : null,
        from_username: form_jolooch_username,
        from_date: new Date(),
        jolooch: jolooch_id,
        jolooch_username: jolooch_username,
        deliveryzone: deliveryzone,
      });
      const data = await OrderModel.findById(id).populate([
        {
          path: "order_products",
          model: OrderProductsModel,
        },
      ]);

      console.log(data);

      sendNotificationfirebase({
        users_id: [jolooch_username],
        title: `№${data?.order_number}-Захиалгыг таньд ${form_jolooch_username}-жолоочоос шилжүүллээ. `,
        body: `Захиалагчын утас: ${
          data?.customer?.phone
        }, Бараа: ${data.order_products
          .map((item: any) => {
            return `(${item.product_name}-${item.too}ш)`;
          })
          .join(", ")} `,
        isNotif: "isNotif",
        datafile: {},
      });

      res.status(200).json({ result: true, message: "Success" });
    }
    res.status(200).json({ result: false, message: "id not found" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ result: false, message: error });
  }
}
