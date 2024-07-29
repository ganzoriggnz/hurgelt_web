import dbConnect from "@/lib/dbConnect";
import { sendNotificationfirebase } from "@/lib/firebase_func";
import OrderModel from "@/models/orders.model";
import OrderProductsModel from "@/models/orders_products.model";
import UserModel from "@/models/users.model";
import UserBalancesModel from "@/models/usersbalance.model";
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
    let { id, tailbar } = req.body;
    console.log(req.body);
    await dbConnect();
    if (id) {
      const orderData = await OrderModel.findById(id).populate([
        {
          path: "order_products",
          model: OrderProductsModel,
        },
        {
          path: "jolooch",
          model: UserModel,
        },
      ]);

      if (orderData && orderData.status == "Хүргэгдсэн") {
        console.log("order", orderData.status);
        for (let index = 0; index < orderData?.order_products.length; index++) {
          const element: any = orderData?.order_products[index];
          await UserBalancesModel.findOneAndUpdate(
            {
              owner: orderData?.jolooch,
              username: orderData?.jolooch_username,
              product: element.product,
              product_code: element.product_code,
            },
            {
              owner: orderData?.jolooch,
              username: orderData?.jolooch_username,
              product: element.product,
              product_code: element.product_code,
              product_name: element.product_name,
              $inc: {
                hurgegdsen: (element?.too ?? 0) * -1,
              },
            }
          );
        }
      }

      let body: any = {
        completedDate: new Date(),
        isCompleted: true,
        isPaid: false,
        completeTailbar: tailbar,
        status: "Цуцлагдсан",
      };
      // console.log(body);
      const order = await OrderModel.findByIdAndUpdate(id, body, {
        new: true,
      }).populate([
        {
          path: "order_products",
          model: OrderProductsModel,
        },
        {
          path: "jolooch",
          model: UserModel,
        },
      ]);

      sendNotificationfirebase({
        users_id: [order?.jolooch_username],
        title: `${order.owner_name}-ажилтан  (${order?.order_number})дугаартай захиалгыг цуцлав.`,
        body: `Захиалагчын утас: ${
          order?.customer_phone
        }, Бараа: ${order.order_products
          .map((item: any) => {
            return `(${item.product_name}-${item.too}ш)`;
          })
          .join(", ")}  \n Шалтгаан:${tailbar}`,
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
