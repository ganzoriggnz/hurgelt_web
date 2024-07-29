import dbConnect, { rgx } from "@/lib/dbConnect";
import InvoiceProductsModel from "@/models/invoices_products.model";
import OrderModel from "@/models/orders.model";
import OrderProductsModel from "@/models/orders_products.model";
import ProductModel from "@/models/products.model";
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
    const { start, end, search }: any = req.body;
    console.log(req.body);

    const searchRgx = rgx(search ?? "");

    await dbConnect();
    const productData = await ProductModel.find({
      code: { $regex: searchRgx, $options: "i" },
    });

    const invoiceProductsOrlogo = await InvoiceProductsModel.aggregate([
      {
        $match: {
          type: "Орлого",

          created_at: {
            $gte: new Date(start),
            $lt: new Date(end),
          },
        },
      },
      {
        $group: {
          _id: "$product",
          too: {
            $sum: "$too",
          },
        },
      },
    ]);
    const invoiceProductsZarlaga = await InvoiceProductsModel.aggregate([
      {
        $match: {
          type: "Зарлага",
          created_at: {
            $gte: new Date(start),
            $lt: new Date(end),
          },
        },
      },
      {
        $group: {
          _id: "$product",
          too: {
            $sum: "$too",
          },
        },
      },
    ]);
    const invoiceProductsHudulguun = await InvoiceProductsModel.aggregate([
      {
        $match: {
          type: "Хөдөлгөөн",
          created_at: {
            $gte: new Date(start),
            $lt: new Date(end),
          },
        },
      },
      {
        $group: {
          _id: "$product",
          too: {
            $sum: "$too",
          },
        },
      },
    ]);
    let where: any = {
      isCompleted: true,
      status: "Хүргэгдсэн",
      completedDate: {
        $gte: new Date(start),
        $lt: new Date(end),
      },
    };
    const borluulagdsan = await OrderModel.find(where, {
      select: { order_products: 1 },
    }).populate([
      {
        path: "order_products",
        model: OrderProductsModel,
        select: { too: 1, product: 1, _id: 0 },
      },
    ]);
    var borlogdsonZahialga: any[] = [];
    borluulagdsan.forEach((element) => {
      borlogdsonZahialga = borlogdsonZahialga.concat(element.order_products);
    });

    var newlist: any[] = [];
    for (let index = 0; index < productData.length; index++) {
      const element = productData[index];
      const temp: any = JSON.parse(JSON.stringify(element));

      const hudulguun = invoiceProductsHudulguun.findLastIndex(
        (e: any) => e?._id == temp?._id
      );
      temp.hudulguun = invoiceProductsHudulguun[hudulguun]?.too ?? 0;

      const orlogo = invoiceProductsOrlogo.findLastIndex(
        (e: any) => e?._id == temp?._id
      );
      temp.orlogodson = invoiceProductsOrlogo[orlogo]?.too ?? 0;

      const zarlaga = invoiceProductsZarlaga.findLastIndex(
        (e: any) => e?._id == temp?._id
      );
      temp.zarlagadsan = invoiceProductsZarlaga[zarlaga]?.too ?? 0;

      temp.hurgegdsen =
        borlogdsonZahialga
          .filter((e) => e.product == element.id)
          .reduce((a: number, b: any) => {
            return a + b.too;
          }, 0) ?? 0;
      temp.aguulahUldegdel =
        temp.orlogodson - temp.zarlagadsan + temp.hudulguun;
      temp.borluultiinUldegdel =
        temp.zarlagadsan - temp.hurgegdsen - temp.hudulguun;
      temp.key = index;
      if (
        element?.balace > 0 ||
        orlogo > -1 ||
        zarlaga > -1 ||
        temp.hurgegdsen > 0
      )
        newlist.push(temp);
    }

    res.status(200).json({
      result: true,
      message: "Success",
      data: newlist.sort(
        (a, b) =>
          b?.orlogodson - a?.orlogodson ||
          b?.zarlagadsan - a?.zarlagadsan ||
          b?.aguulahUldegdel - a?.aguulahUldegdel
      ),
    });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
