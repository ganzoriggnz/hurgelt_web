import dbConnect from "@/lib/dbConnect";
import { authApple } from "@/lib/utils";
import LogModel from "@/models/logs.model";
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
  await dbConnect();

  const { idToken, authCode } = req.body;

  const temp: any = await authApple(idToken);
  console.log(temp);

  await LogModel.create({
    log: req.body ?? "",
    path: req.url ?? "",
    query: req.query ? JSON.stringify(req.query) : "",
    method: req.method ?? "",
    data: temp,
  });

  // const { email, name } = await authorizeGoogle(idToken);

  // if (email && name) {
  //   let token: string;
  //   await dbConnect();
  //   const user: any = await UserModel.findOne({
  //     email: email,
  //   });
  //   if (user) {
  //     await UserModel.updateOne(
  //       {
  //         username: user.username?.toLowerCase(),
  //       },
  //       { last_login: new Date() }
  //     );
  //     user.password = "";
  //     token = jwt.sign(
  //       {
  //         user,
  //       },
  //       process.env.JWT_SECRET_KEY ?? "GURU2023TOKENGANZORIGDEV20249FZIGFVRSTAR",
  //       user.role != "жолооч" ? { expiresIn: "24h" } : {}
  //     );
  //     user.token = token;
  //     const cookie = serializeCookie("accessToken", token, {
  //       path: "/",
  //       maxAge: 1 * 10 * 60 * 60 * 1000,
  //     });
  //     res
  //       .status(200)
  //       .setHeader("Set-Cookie", user.level != 3 ? cookie : "")
  //       .json({
  //         login: true,
  //         data: token,
  //         jwt: token,
  //         user,
  //       });
  //   } else {
  //     res.status(201).json({
  //       login: false,
  //       data: null,
  //       message: "Хэрэглэгч байхгүй байна!",
  //     });
  //   }
  // } else {
  //   res.status(201).json({
  //     login: false,
  //     data: null,
  //     message: "Алдаа үг буруу байна!!!",
  //   });
  // }

  res.status(200).json({
    login: false,
    data: null,
    message: "user not found",
  });
}
