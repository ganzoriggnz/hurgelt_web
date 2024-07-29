import dbConnect, { rgx, rgxStart } from "@/lib/dbConnect";
import InvoiceModel from "@/models/invoices.model";
import UserModel from "@/models/users.model";
import dayjs from "dayjs";
import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import InvoiceProductsModel from "../../../models/invoices_products.model";

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
    const { offset, limit, sort, search, start, end, codeSearch, type }: any =
      req.body;
    console.log(req.body);
    const searchRgx = rgx(search);
    const codeSearchRgx = rgxStart(codeSearch ?? "");
    const where: any = {
      $or: [
        { invoice_number: { $regex: searchRgx, $options: "i" } },
        { from_username: { $regex: searchRgx, $options: "i" } },
        { to_username: { $regex: searchRgx, $options: "i" } },
      ],
    };
    if (start && end) {
      where.created_at = {
        $gte: dayjs(start),
        $lt: dayjs(end),
      };
    }
    if (type && type.length > 0) {
      where.type = type;
    }
    await dbConnect();
    const totalcnt = (await InvoiceModel.countDocuments(where)) ?? 0;
    const data = await InvoiceModel.find(where)
      .populate([
        {
          path: "invoice_products",
          model: InvoiceProductsModel,
          match: {
            product_code: { $regex: codeSearchRgx, $options: "i" },
          },
        },
        {
          path: "owner",
          model: UserModel,
        },
        {
          path: "from_user",
          model: UserModel,
        },
        {
          path: "to_user",
          model: UserModel,
        },
      ])
      .limit(limit ?? 30)
      .skip(offset)
      .sort(sort ?? { created_at: -1 })
      .then((datas) =>
        datas.filter(
          (item) =>
            item?.invoice_products != null && item?.invoice_products?.length > 0
        )
      );

    res.status(200).json({ result: true, message: "Success", data, totalcnt });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ message: e });
  }
}
