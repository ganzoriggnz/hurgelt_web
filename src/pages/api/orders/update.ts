import dbConnect from "@/lib/dbConnect";
import { sendNotificationfirebase } from "@/lib/firebase_func";
import CustomerModel from "@/models/customers.model";
import OrderModel from "@/models/orders.model";
import jwt from "jsonwebtoken";
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
    let { body } = req.body;
    await dbConnect();
    const token =
      (req?.cookies?.accessToken as string) ??
      req.headers?.authorization?.split("Bearer ").at(1)?.toString();
    const clientData: any = jwt.decode(token);
    if (clientData?.user?.isActive == false) {
      return res.status(401).json({
        result: false,
        message: "Байхгүй эсвэл идвэхгүй хэрэглэгч байна !!!",
      });
    }
    if (body) {
      await CustomerModel.findByIdAndUpdate(body?.customer?._id, {
        address: body?.address,
      });
      // console.log("body", body);
      let status = body?.status;
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
      const order = await OrderModel.findByIdAndUpdate(
        body?.order_id,
        {
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
          customer_name: body?.name,
          duureg: body?.duureg,
          horoo: body?.horoo,
          nemelt: body?.nemelt,
          address: body?.address,
          huleejawahudur: body?.huleejawahudur,
          huleejawahtsag: body?.huleejawahtsag,
          horoolol: body?.horoolol,
          niitleg_bairshil: body?.niitleg_bairshil,
          status: status,
        },
        { new: true }
      );

      sendNotificationfirebase({
        users_id: [body?.jolooch_username],
        title: `№${body?.order_number}-Захиалгын мэдээлэл шинэчлэгдлээ.`,
        body: `Захиалагчын утас: ${
          order?.customer_phone
        }, Бараа: ${body.order_product
          .map((item: any) => {
            return `(${item.product_name}-${item.too}ш)`;
          })
          .join(", ")} `,
        isNotif: "isNotif",
        datafile: {},
      });

      res.status(200).json({ result: true, message: "Success" });
    }
  } catch (error) {
    res.status(400).json({ message: error });
  }
}
