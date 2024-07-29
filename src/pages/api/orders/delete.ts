import dbConnect from "@/lib/dbConnect";
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
  try {
    const { id } = req.query;
    await dbConnect();
    const orderDeleteData = await OrderModel.findById(id).populate([
      {
        path: "order_products",
        model: OrderProductsModel,
      },
      {
        path: "jolooch",
        model: UserModel,
      },
    ]);
    if (orderDeleteData && orderDeleteData.status == "Хүргэгдсэн") {
      console.log("orderDeleteData", orderDeleteData.status);
      //TODO хүргэгдсэн захиалгын барааг устгах үед тухайн жолоочын бараанаас хассан барааг буцааж нэмэх
      for (
        let index = 0;
        index < orderDeleteData?.order_products.length;
        index++
      ) {
        const element: any = orderDeleteData?.order_products[index];
        await UserBalancesModel.findOneAndUpdate(
          {
            owner: orderDeleteData?.jolooch,
            username: orderDeleteData?.jolooch_username,
            product: element.product,
          },
          {
            owner: orderDeleteData?.jolooch,
            username: orderDeleteData?.jolooch_username,
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

    const temp = await OrderModel.findOneAndDelete({
      _id: id ?? req.body?.id,
    });
    await OrderProductsModel.deleteMany({
      order_number: temp?.order_number,
    });
    res.status(200).json({ result: true, message: "Success" });
  } catch (error) {
    res.status(400).json({ message: error });
  }
}
