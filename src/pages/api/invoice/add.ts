import dbConnect from "@/lib/dbConnect";
import InvoiceModel from "@/models/invoices.model";
import ProductModel from "@/models/products.model";
import UserBalancesModel from "@/models/usersbalance.model";
import mongoose from "mongoose";
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
  const newId2 = new mongoose.Types.ObjectId();
  try {
    let { body }: any = req.body;
    if (body) {
      console.log(body);
      await dbConnect();
      const invoiceNumber = Date.now();
      const dataInvoice = await InvoiceModel.create({
        _id: newId2,
        invoice_number: invoiceNumber,
        owner: body?.owner,
        owner_name: body?.owner_name,
        type: body?.type,
        invoice_product: body?.invoice_product,
        total_price:
          body?.total_price ??
          body?.invoice_product?.reduce(
            (a: number, b: any) => a + (b.sale_price ?? 0) * (b.too ?? 1),
            0
          ),
        too: body?.too,
        from_user: body?.from_user,
        from_username: body?.from_username,
        to_user: body?.to_user,
        to_username: body?.to_username,
        isPaid: body?.isPaid,
        isCompleted: body?.isCompleted,
      });
      for (let index = 0; index < body?.invoice_product.length; index++) {
        const element = body?.invoice_product[index];
        const toot =
          typeof element?.too == "string"
            ? Number.parseInt(element?.too)
            : element?.too ?? 0;

        if (body?.type != "Хөдөлгөөн") {
          try {
            await ProductModel.findByIdAndUpdate(element.product, {
              $inc: {
                balance:
                  body?.type == "Орлого" ? element.too : element.too * -1,
              },
            });
          } catch (e) {
            await ProductModel.findByIdAndUpdate(element.product, {
              balance: toot,
            });
            console.log("ERROR::::::::", e);
          }
        }

        if (body?.type == "Орлого") {
          await UserBalancesModel.findOneAndUpdate(
            {
              owner: body?.to_user,
              username: body?.to_username,
              product: element.product,
            },
            {
              owner: body?.to_user,
              username: body?.to_username,
              product: element.product,
              product_code: element.product_code,
              product_name: element.product_name,
              $inc: {
                orlogodson: toot,
              },
            },
            { upsert: true }
          );
        } else if (body?.type == "Зарлага") {
          await UserBalancesModel.findOneAndUpdate(
            {
              owner: body?.to_user,
              username: body?.to_username,
              product: element.product,
            },
            {
              owner: body?.to_user,
              username: body?.to_username,
              product: element.product,
              product_code: element.product_code,
              product_name: element.product_name,
              $inc: {
                orlogodson: toot,
              },
            },
            { upsert: true }
          );
          if (
            body?.from_user != body?.to_user &&
            body?.from_user &&
            body?.from_username
          ) {
            await UserBalancesModel.findOneAndUpdate(
              {
                owner: body?.from_user,
                username: body?.from_username,
                product: element.product,
              },
              {
                owner: body?.from_user,
                username: body?.from_username,
                product: element.product,
                product_code: element.product_code,
                product_name: element.product_name,
                $inc: {
                  zarlagadsan: toot,
                },
              },
              { upsert: true }
            );
          }
        } else if (body?.type == "Хөдөлгөөн") {
          await UserBalancesModel.findOneAndUpdate(
            {
              owner: body?.to_user,
              username: body?.to_username,
              product: element.product,
            },
            {
              owner: body?.to_user,
              username: body?.to_username,
              product: element.product,
              product_code: element.product_code,
              product_name: element.product_name,
              $inc: {
                orlogodson: toot,
              },
            },
            { upsert: true }
          );

          if (
            body?.from_user != body?.to_user &&
            body?.from_user &&
            body?.from_username
          ) {
            await UserBalancesModel.findOneAndUpdate(
              {
                owner: body?.from_user,
                username: body?.from_username,
                product: element.product,
              },
              {
                owner: body?.from_user,
                username: body?.from_username,
                product: element.product,
                product_code: element.product_code,
                product_name: element.product_name,
                $inc: {
                  zarlagadsan: toot,
                },
              },
              { upsert: true }
            );
          }
        }
      }
      res
        .status(200)
        .json({ result: true, message: "Success", data: dataInvoice, newId2 });
    }
    res.status(200).json({ result: true, message: "Success" });
  } catch (e) {
    console.log("api/invoice/create::ERROR:", e);

    res.status(400).json({ message: e });
  }
}
