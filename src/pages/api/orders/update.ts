import dbConnect from "@/lib/dbConnect";
import { sendNotificationfirebase } from "@/lib/firebase_func";
import CustomerModel from "@/models/customers.model";
import OrderModel from "@/models/orders.model";
import OrderProductsModel from "@/models/orders_products.model";
import UserModel from "@/models/users.model";
import { IOrderProducts } from "@/types/next";
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
    if (body) {
      await CustomerModel.findByIdAndUpdate(body?.customer?._id, {
        name: body?.name,
        duureg: body?.duureg,
        horoo: body?.horoo,
        horoolol: body?.horoolol,
        niitleg_bairshil: body?.niitleg_bairshil,
        address: body?.address,
        other: body?.other,
      });

      const order_productsList: IOrderProducts[] = body?.order_products?.map(
        (item: any) => {
          const prod = item?.product ? JSON.parse(item?.product) : {};
          return {
            order_number: body?.order_number,
            customer: body?.customer?._id,
            product: prod?._id,
            product_code: prod?.code,
            product_name: prod?.name,
            delivery_price: prod?.delivery_price,
            sale_price: prod?.price,
            too: item?.too ? Number.parseInt(item?.too) : 0,
          };
        }
      );
      await OrderProductsModel.deleteMany({ order_number: body?.order_number });
      let listTemp = [];
      for (let index = 0; index < order_productsList.length; index++) {
        const element: IOrderProducts = order_productsList[index];
        element.jolooch = body?.jolooch_user;
        element.jolooch_username = body?.jolooch_username;
        const idIP = await OrderProductsModel.create(element);
        listTemp.push(idIP);
      }
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
          order_products: listTemp,
          order_product: body?.order_product,
          total_price: body?.total_price,
          total_sale_price: body?.total_sale_price,
          delivery_total_price: body?.delivery_total_price,
          too: body?.too,
          deliveryzone: body?.deliveryzone,
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
        }, Бараа: ${order_productsList
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
