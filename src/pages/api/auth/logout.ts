import { serializeCookie } from "@/lib";
import dbConnect from "@/lib/dbConnect";
import { logOutViaGoogleRevokeAxios } from "@/lib/utils";
import UserModel from "@/models/users.model";
import { getCookie } from "cookies-next";
import jwt from "jsonwebtoken";
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
  await NextCors(req, res, {
    methods: ["POST"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  const token: any = jwt.decode(
    req?.headers?.authorization?.split("Bearer ").at(1) ?? ""
  );
  const idToken: any = getCookie("idToken", { req, res });
  if (idToken) {
    await logOutViaGoogleRevokeAxios(idToken);
  }
  if (token) {
    try {
      await dbConnect();
      await UserModel.updateOne(
        { username: token?.user?.username },
        { logout_at: new Date() }
      );
      res
        .status(200)
        .setHeader(
          "Set-Cookie",
          serializeCookie(
            "accessToken",
            {},
            { path: "/", expires: new Date(Date.now()) }
          )
        )
        .json({ logout: true });
    } catch (e) {
      res.status(405).json({ message: e });
    }
  } else {
    res
      .status(200)
      .setHeader(
        "Set-Cookie",
        serializeCookie(
          "accessToken",
          {},
          { path: "/", expires: new Date(Date.now()) }
        )
      )
      .json({ logout: true });
  }
}
