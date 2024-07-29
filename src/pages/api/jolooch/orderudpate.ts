import dbConnect from "@/lib/dbConnect";
import { sendNotificationfirebaseLevel } from "@/lib/firebase_func";
import OrderModel from "@/models/orders.model";
import OrderProductsModel from "@/models/orders_products.model";
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
    let { id, type, paymentType, tailbar, payment_date, newList, oldList } =
      req.body;
    // console.log("orderupdate:::::", req.body);
    await dbConnect();
    if (id) {
      const oldDataOrder = await OrderModel.findById(id, {
        select: { isCompleted: 1 },
      });
      if (oldDataOrder?.isCompleted && oldDataOrder?.isCompleted == true) {
        res.status(200).json({ result: true, message: "Амжилттай хадгалсан." });
        return;
      }
      let body: any = {
        isPaid: payment_date,
        payment_type: type ? paymentType : null,
        completedDate: new Date(),
        order_product: [],
        isCompleted: true,
        completeTailbar: tailbar,
        status: type ? "Хүргэгдсэн" : "Цуцлагдсан",
      };
      if (payment_date && payment_date == true) {
        body.payment_date = new Date();
      }
      var newtotal_sale_price = 0;
      var newdelivery_total_price = 0;
      var newtoo = 0;
      let listTemp = [];
      if (type) {
        if (oldList && oldList?.length > 0) {
          for (let index = 0; index < oldList.length; index++) {
            if (oldList[index]) {
              const ele = oldList[index];
              if (ele?.too > 0) {
                newtoo += ele?.too;
                newtotal_sale_price += (ele?.sale_price ?? 0) * ele?.too;
                newdelivery_total_price +=
                  (ele?.delivery_price ?? 0) * ele?.too;
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
              body.order_product.push({
                product: ele?.product?.id,
                product_code: ele?.product_code,
                product_name: ele?.product_name,
                too: ele?.too,
                sale_price: ele?.sale_price ?? 0,
                delivery_price: ele?.delivery_price ?? 0,
              });
              listTemp.push(newsd);
            }
          }
        }
        if (newList && newList?.length > 0) {
          for (let index = 0; index < newList.length; index++) {
            if (newList[index]) {
              const ele = newList[index];
              if (ele?.too > 0) {
                newtoo += ele?.too;
                newtotal_sale_price += (ele?.sale_price ?? 0) * ele?.too;
                newdelivery_total_price +=
                  (ele?.delivery_price ?? 0) * ele?.too;
              }
              const kkkee = await OrderProductsModel.create({
                order_number: ele?.order_number,
                customer: ele?.customer,
                product: ele?.product?.id,
                product_code: ele?.product_code,
                product_name: ele?.product_name,
                jolooch: oldDataOrder?.jolooch,
                jolooch_username: oldDataOrder?.jolooch_username,
                delivery_price: ele?.delivery_price ?? 0,
                sale_price: ele?.sale_price ?? 0,
                too: ele?.too,
              });
              body.order_product.push({
                product: ele?.product?.id,
                product_code: ele?.product_code,
                product_name: ele?.product_name,
                delivery_price: ele?.delivery_price ?? 0,
                sale_price: ele?.sale_price ?? 0,
                too: ele?.too,
              });
              listTemp.push(kkkee);
            }
          }
        }
      }

      body.too = newtoo;
      body.total_price = newtotal_sale_price + newdelivery_total_price;
      if (listTemp.length > 0) body.order_products = listTemp;
      body.total_sale_price = newtotal_sale_price;
      body.delivery_total_price = newdelivery_total_price;
      const order = await OrderModel.findByIdAndUpdate(id, body, {
        new: true,
      }).populate([
        {
          path: "order_products",
          model: OrderProductsModel,
        },
      ]);

      // const order = await OrderModel.findById(id).populate([
      //   {
      //     path: "order_products",
      //     model: OrderProductsModel,
      //   },
      // ]);

      if (
        type != null &&
        type == true &&
        order.status == "Хүргэгдсэн" &&
        order.isToolson != true
      ) {
        // console.log("userbalance hasna:::", type);
        if (order && order?.order_products) {
          for (let index = 0; index < order?.order_products.length; index++) {
            try {
              const element = order?.order_products[index];
              const newdd = await UserBalancesModel.findOneAndUpdate(
                {
                  owner: order?.jolooch,
                  username: order?.jolooch_username,
                  product: element.product,
                  product_code: element.product_code,
                },
                {
                  owner: order?.jolooch,
                  username: order?.jolooch_username,
                  product: element.product,
                  product_code: element.product_code,
                  product_name: element.product_name,
                  $inc: {
                    hurgegdsen: element?.too ?? 0,
                  },
                },
                { upsert: true, new: true }
              );
            } catch (e) {
              console.log(
                "[ERROR][orderupdate] UserBalancesModel.findOneAndUpdate :::: ",
                e
              );
            }
          }
          await OrderModel.findByIdAndUpdate(id, { isToolson: true });
        }
      } else {
        sendNotificationfirebaseLevel({
          level: [0, 1],
          title: `${order.jolooch_username} -жолооч  (${order?.order_number})дугаартай захиалгыг цуцлав.`,
          body: `Захиалагчын утас: ${
            order?.customer_phone
          }, Бараа: ${order.order_products
            .map((item: any) => {
              return `(${item.product_name}-${item.too}ш)`;
            })
            .join(", ")} `,
          isNotif: "isNotif",
          datafile: {},
        });
      }
      res.status(200).json({ result: true, message: "Амжилттай хадгалсан." });
    }
    res.status(200).json({ result: false, message: "id not found" });
  } catch (error) {
    res.status(400).json({ result: false, message: error });
  }
}
