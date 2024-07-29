import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/models/orders.model";
import OrderProductsModel from "@/models/orders_products.model";
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
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  try {
    let { id, duureg, address, huleejawahudur, newList, oldList } = req.body;

    console.log("orderchangeUpdate:::::::: :", req.body);

    if (id) {
      let body: any = {
        duureg: duureg,
        address: address,
        huleejawahudur: dayjs(huleejawahudur),
      };
      await dbConnect();

      var newtotal_sale_price = 0;
      var newdelivery_total_price = 0;
      var newtoo = 0;
      let listTemp = [];

      var jolooch = "";
      var jolooch_username = "";

      if (oldList && oldList?.length > 0) {
        for (let index = 0; index < oldList.length; index++) {
          const ele = oldList[index];
          jolooch = ele?.jolooch;
          jolooch_username = ele?.jolooch_username;
          if (ele?.too > 0) {
            newtoo += ele?.too;
            newtotal_sale_price += (ele?.sale_price ?? 0) * ele?.too;
            newdelivery_total_price += (ele?.delivery_price ?? 0) * ele?.too;
          }
          const newsd = await OrderProductsModel.findByIdAndUpdate(
            ele?.id,
            {
              too: ele?.too,
              sale_price: ele?.sale_price ?? 0,
              delivery_price: ele?.delivery_price ?? 0,
            },
            { new: true }
          );
          listTemp.push(newsd);
        }
      }
      if (newList && newList?.length > 0) {
        for (let index = 0; index < newList.length; index++) {
          const ele = newList[index];
          if (ele?.too > 0) {
            newtoo += ele?.too;
            newtotal_sale_price += (ele?.sale_price ?? 0) * ele?.too;
            newdelivery_total_price += (ele?.delivery_price ?? 0) * ele?.too;
          }
          const kkkee = await OrderProductsModel.create({
            order_number: ele?.order_number,
            customer: ele?.customer,
            product: ele?.product?.id,
            product_code: ele?.product_code,
            jolooch: jolooch,
            jolooch_username: jolooch_username,
            product_name: ele?.product_name,
            delivery_price: ele?.delivery_price ?? 0,
            sale_price: ele?.sale_price ?? 0,
            too: ele?.too,
          });
          listTemp.push(kkkee);
        }
      }

      body.too = newtoo;
      body.total_price = newtotal_sale_price + newdelivery_total_price;
      if (listTemp.length > 0) body.order_products = listTemp;
      body.total_sale_price = newtotal_sale_price;
      body.delivery_total_price = newdelivery_total_price;

      await OrderModel.findByIdAndUpdate(id, body, {
        new: true,
      });

      // sendNotificationfirebase({
      //   users_id: [jolooch_username],
      //   title: `№${data?.order_number}-Захиалгыг таньд ${form_jolooch_username}-жолоочоос шилжүүллээ. `,
      //   body: `Захиалагчын утас: ${
      //     data?.customer?.phone
      //   }, Бараа: ${data.order_products
      //     .map((item: any) => {
      //       return `(${item.product_name}-${item.too}ш)`;
      //     })
      //     .join(", ")} `,
      //   isNotif: "isNotif",
      //   datafile: {},
      // });
    }
    res.status(200).json({ result: true, message: "Success update!" });

    res.status(200).json({ result: false, message: "id not found" });
  } catch (error) {
    res.status(400).json({ result: false, message: error });
  }
}
