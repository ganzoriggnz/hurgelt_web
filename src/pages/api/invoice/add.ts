import dbConnect from "@/lib/dbConnect";
import InvoiceModel from "@/models/invoices.model";
import InvoiceProductsModel from "@/models/invoices_products.model";
import ProductModel from "@/models/products.model";
import UserBalancesModel from "@/models/usersbalance.model";
import { IInvoiceProducts } from "@/types/next";
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
      // const lastinvoice = await InvoiceModel.findOne({ type: body?.type }).sort(
      //   { _id: -1 }
      // );
      const invoiceNumber = Date.now();
      // if (lastinvoice) {
      //   invoiceNumber =
      //     dayjs(new Date()).format("YYMMDD") +
      //     InvoiceNumber.next(
      //       lastinvoice.invoice_number.substring(
      //         lastinvoice.invoice_number.length - 4
      //       )
      //     );
      // } else {
      //   invoiceNumber =
      //     dayjs(new Date()).format("YYMMDD") +
      //     InvoiceNumber.next((body?.type == "Орлого" ? "A" : "S") + "000");
      // }
      console.log(" invoiceNumber", invoiceNumber);
      // console.log(" body::: ", body);

      const invoice_productsList: IInvoiceProducts[] =
        body?.invoice_products?.map((item: any) => {
          const prod = item?.product ? JSON.parse(item?.product) : {};
          const too =
            typeof item?.too == "string"
              ? Number.parseInt(item?.too)
              : item?.too ?? 0;
          return {
            invoice_number: invoiceNumber,
            owner: body?.owner,
            type: body?.type,
            product: prod?._id,
            product_code: prod?.code,
            product_name: prod?.name,
            price: prod?.price,
            sale_price: prod?.delivery_price + prod?.price,
            too: too,
          };
        });
      let listTemp = [];
      for (let index = 0; index < invoice_productsList.length; index++) {
        const element: IInvoiceProducts = invoice_productsList[index];
        const idIP = await InvoiceProductsModel.create(element);
        listTemp.push(idIP);
      }
      const dataInvoice = await InvoiceModel.create({
        _id: newId2,
        invoice_number: invoiceNumber,
        owner: body?.owner,
        owner_name: body?.owner_name,
        type: body?.type,
        invoice_products: listTemp,
        invoice_product: body?.invoice_product,
        total_price:
          body?.total_price ??
          invoice_productsList?.reduce(
            (a: number, b: IInvoiceProducts) =>
              a + (b.sale_price ?? 0) * (b.too ?? 1),
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
      for (let index = 0; index < invoice_productsList.length; index++) {
        const element: IInvoiceProducts = invoice_productsList[index];
        const toot =
          typeof element?.too == "string"
            ? Number.parseInt(element?.too)
            : element?.too ?? 0;

        if (element.type != "Хөдөлгөөн") {
          try {
            await ProductModel.findByIdAndUpdate(element.product, {
              $inc: {
                balance:
                  element.type == "Орлого" ? element.too : element.too * -1,
              },
            });
          } catch (e) {
            await ProductModel.findByIdAndUpdate(element.product, {
              balance: toot,
            });
            console.log("ERROR::::::::", e);
          }
        }

        if (element.type == "Орлого") {
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
        } else if (element.type == "Зарлага") {
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
        } else if (element.type == "Хөдөлгөөн") {
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
