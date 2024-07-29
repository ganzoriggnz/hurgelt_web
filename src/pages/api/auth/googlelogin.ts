import { serializeCookie } from "@/lib";
import dbConnect from "@/lib/dbConnect";
import { authorizeGoogle } from "@/lib/utils";
import UserModel from "@/models/users.model";
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
  await NextCors(req, res, {
    methods: ["POST"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  const { idToken, device_token } = req.body;
  const { email, name } = await authorizeGoogle(idToken);

  if (email && name) {
    let token: string;
    await dbConnect();
    const user: any = await UserModel.findOne({
      isActive: true,
      email: email,
    });
    if (user) {
      const userupdate: any = { last_login: new Date() };
      if (device_token.length > 0) {
        userupdate.device_token = device_token;
      }
      await UserModel.updateOne(
        {
          username: user.username?.toLowerCase(),
        },
        userupdate
      );
      user.password = "";
      token = jwt.sign(
        {
          user,
        },
        process.env.JWT_SECRET_KEY ??
          "GURU2023TOKENGANZORIGDEV20249FZIGFVRSTAR",
        user.role != "жолооч" ? { expiresIn: "24h" } : {}
      );
      user.token = token.toString();
      const cookie = serializeCookie("accessToken", token, {
        path: "/",
        maxAge: 72 * 3600,
      });
      res.status(200).setHeader("Set-Cookie", cookie).json({
        login: true,
        data: token,
        jwt: token,
        user,
      });
      return;
    } else {
      res.status(201).json({
        login: false,
        data: null,
        message: "Хэрэглэгч байхгүй байна!",
      });
      return;
    }
  } else {
    res.status(201).json({
      login: false,
      data: null,
      message: "Алдаа үг буруу байна!!!",
    });
    return;
  }
}
