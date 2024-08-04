import dbConnect from "@/lib/dbConnect";
import InvoiceModel from "@/models/invoices.model";
import ProductModel from "@/models/products.model";
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
    if (!id) {
      return res
        .status(201)
        .json({ result: false, message: "id байхгүй байна!" });
    }
    await dbConnect();
    const invoice = await InvoiceModel.findById(id).populate([
      {
        path: "from_user",
        model: UserModel,
      },
      {
        path: "to_user",
        model: UserModel,
      },
    ]);

    if (invoice) {
      for (let index = 0; index < invoice?.invoice_product.length; index++) {
        const element: any = invoice?.invoice_product[index];
        try {
          await ProductModel.findByIdAndUpdate(element.product, {
            $inc: {
              balance:
                element.type == "Орлого" ? element.too * -1 : element.too,
            },
          });
        } catch (e) {
          console.log("ALDAA!!! : ", e);
        }
        await UserBalancesModel.findOneAndUpdate(
          {
            owner: invoice?.to_user,
            username: invoice?.to_username,
            product: element.product,
          },
          {
            $inc: {
              orlogodson: (element?.too ?? 0) * -1,
            },
          }
        );
        if (invoice?.from_user && invoice?.from_username) {
          await UserBalancesModel.findOneAndUpdate(
            {
              owner: invoice?.from_user,
              username: invoice?.from_username,
              product: element.product,
            },
            {
              $inc: {
                zarlagadsan: (element?.too ?? 0) * -1,
              },
            }
          );
        }
      }
    }
    const temp = await InvoiceModel.findOneAndDelete({
      _id: id ?? req.body?.id,
    });

    return res.status(200).json({ result: true, message: "Success" });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
}
