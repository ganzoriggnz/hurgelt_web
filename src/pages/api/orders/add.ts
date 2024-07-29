import dbConnect from "@/lib/dbConnect";
import { sendNotificationfirebase } from "@/lib/firebase_func";
import CustomerModel from "@/models/customers.model";
import OrderModel from "@/models/orders.model";
import UserModel from "@/models/users.model";
import dayjs from "dayjs";
import jwt from "jsonwebtoken";
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
    let { body }: any = req.body;
    if (body) {
      console.log("ORDER ADD : ", body);

      await dbConnect();
      const token =
        (req?.cookies?.accessToken as string) ??
        req.headers?.authorization?.split("Bearer ").at(1)?.toString();
      const clientData: any = jwt.decode(token);
      const clidcheck = await UserModel.findOne({
        username: clientData?.user?.username,
        isActive: true,
      });
      if (!clidcheck) {
        return res.status(401).json({
          result: false,
          message: "Байхгүй эсвэл идвэхгүй хэрэглэгч байна !!!",
        });
      }
      let order_number = Date.now();
      console.log("order_number,", order_number);
      const customerid = await CustomerModel.findOneAndUpdate(
        { phone: body?.customer_phone?.trim() },
        {
          address: body?.address,
        },
        { new: true, upsert: true }
      );

      let status = "Бүртгэсэн";
      if (body?.jolooch_user) {
        status = "Хүргэлтэнд";
      } else if (
        body?.jolooch_user == null &&
        (body?.address?.length == 0 || !body?.address)
      ) {
        status = "Ноорог";
      } else if (body?.address?.length > 0 && body?.jolooch_user == null) {
        status = "Бүртгэсэн";
      }

      await OrderModel.create({
        order_number: order_number,
        owner: body?.owner,
        owner_name: body?.owner_name,
        order_product: body?.order_product,
        total_price: body?.total_price,
        total_sale_price: body?.total_sale_price,
        delivery_total_price: body?.delivery_total_price,
        too: body?.too,
        jolooch: body?.jolooch_user,
        jolooch_username: body?.jolooch_username,
        zone: body?.zone,
        isPaid: body?.isPaid,
        payment_type: body?.payment_type,
        customer: customerid,
        customer_phone: body?.customer_phone,
        duureg: body?.duureg,
        nemelt: body?.nemelt,
        address: body?.address,
        huleejawahudur: body?.huleejawahudur,
        huleejawahtsag: body?.huleejawahtsag,
        status: status,
        list_rank: new Date(),
      });
      if (body?.jolooch_username)
        sendNotificationfirebase({
          users_id: [body?.jolooch_username],
          title: `${body?.jolooch_username}-д шинэ хүргэлт ирлээ.`,
          body: `Захиалагчын утас: ${
            body?.customer_phone
          }, Бараа: ${body?.order_product
            .map((item: any) => {
              return `(${item.product_name}-${item.too}ш)`;
            })
            .join(", ")} \n Хүлээж авах өдөр: ${dayjs(
            body?.huleejawahudur
          ).format("MM/DD")}`,
          isNotif: "isNotif",
          datafile: {},
        });
    }
    res.status(200).json({ result: true, message: "Success" });
  } catch (e) {
    console.log("api/orders/add::ERROR:", e);
    return res.status(400).json({ result: false, message: JSON.stringify(e) });
  }
}
