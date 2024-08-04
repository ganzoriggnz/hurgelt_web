import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/models/orders.model";
import dayjs from "dayjs";
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
    res
      .status(405)
      .send({ result: false, message: "Only POST requests allowed" });
    return;
  }
  try {
    let {
      id,
      duureg,
      address,
      huleejawahudur,
      newList,
      oldList,
      order_product,
    } = req.body;
    console.log("orderjoloochupdate:::::::: :", req.body);

    if (id) {
      let body: any = {
        duureg: duureg,
        address: address,
        order_product: order_product,
        huleejawahudur: dayjs(huleejawahudur),
      };

      var newtotal_sale_price = order_product?.reduce(
        (a: number, b: any) => a + b.sale_price * b.too,
        0
      );
      var newdelivery_total_price = order_product?.reduce(
        (a: number, b: any) => a + b.delivery_price * b.too,
        0
      );
      body.too = order_product?.reduce((a: number, b: any) => a + b.too, 0);
      body.total_price = newtotal_sale_price + newdelivery_total_price;
      body.total_sale_price = newtotal_sale_price;
      body.delivery_total_price = newdelivery_total_price;
      await dbConnect();
      await OrderModel.findByIdAndUpdate(id, body, {
        new: true,
      });

      // sendNotificationfirebase({
      //   users_id: [jolooch_username],
      //   title: `№${data?.order_number}-Захиалгыг таньд ${form_jolooch_username}-жолоочоос шилжүүллээ. `,
      //   body: `Захиалагчын утас: ${
      //     data?.customer?.phone
      //   }, Бараа: ${data.order_product
      //     .map((item: any) => {
      //       return `(${item.product_name}-${item.too}ш)`;
      //     })
      //     .join(", ")} `,
      //   isNotif: "isNotif",
      //   datafile: {},
      // });
      res.status(200).json({ result: true, message: "Success update!" });
    } else res.status(200).json({ result: false, message: "id not found" });
  } catch (error) {
    console.log("aldaa", error);
    res.status(400).json({ result: false, message: error });
  }
}
