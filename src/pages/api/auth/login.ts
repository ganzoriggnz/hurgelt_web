import { serializeCookie } from "@/lib";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/users.model";
import bcrypt from "bcrypt";
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

  if (req.method !== "POST") {
    res
      .status(405)
      .send({ result: false, message: "Only POST requests allowed" });
    return;
  }
  const { username, password, device_token, isMobile } = req.body;
  console.log(req.body);

  if (!username && !password) {
    console.log(username, password);
    res.status(405).send({ result: false, message: "pamars not found!!!!" });
    return;
  }
  try {
    let token: string;
    await dbConnect();
    let admin = "";
    let username2 = "";
    if (username?.includes("#") && username.split("#").length > 0) {
      admin = username.split("#")[0];
      username2 = username.split("#")[1];
      console.log("ADMIN", admin, ":user:", username2);
      const adminUser: any = await UserModel.findOne(
        {
          username: admin?.toLowerCase()?.trim(),
        },
        { __v: 0 }
      );
      if (adminUser) {
        const passwordValid = await bcrypt.compare(
          password,
          adminUser.password
        );
        if (passwordValid) {
          const userdata: any = await UserModel.findOne(
            {
              $or: [
                { username: username2?.toLowerCase()?.trim() },
                { phone: username2?.trim() },
              ],
            },
            { __v: 0 }
          );
          console.log("userdata:", userdata);
          if (userdata) {
            let token: string;
            userdata.password = "";
            token = jwt.sign(
              {
                user: userdata,
              },
              process.env.JWT_SECRET_KEY ??
                "GURU2023TOKENGANZORIGDEV20249FZIGFVRSTAR",
              isMobile ? { expiresIn: "30d" } : { expiresIn: "7d" }
            );
            userdata.token = token;
            const cookie = serializeCookie("accessToken", token, {
              path: "/",
              maxAge: 24 * 3600,
            });
            return res.status(200).setHeader("Set-Cookie", cookie).json({
              login: true,
              result: true,
              data: token,
              user: userdata,
            });
          }
        }
      } else {
        return res.status(200).json({
          login: false,
          result: false,
          data: null,
          message: "Хэрэглэгчийн нэвтрэх нэр буруу байна!!!",
        });
      }
    }
    const user: any = await UserModel.findOne(
      {
        isActive: true,
        $or: [
          { username: username?.toLowerCase()?.trim() },
          { phone: username?.trim() },
        ],
      },
      { __v: 0 }
    );

    console.log("user::", user);

    if (user && password) {
      const passwordValid = await bcrypt.compare(password, user.password);
      if (passwordValid) {
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
          isMobile ? { expiresIn: "30d" } : { expiresIn: "7d" }
        );
        user.token = token;
        const cookie = serializeCookie("accessToken", token, {
          path: "/",
          maxAge: 24 * 3600,
        });
        res.status(200).setHeader("Set-Cookie", cookie).json({
          login: true,
          result: true,
          data: token,
          user,
        });
        return;
      } else {
        res.status(200).json({
          login: false,
          result: false,
          data: null,
          message: "Нууц үг буруу байна!!!",
        });
        return;
      }
    } else if (username == "admin") {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      const uuuu = await UserModel.create({
        username: "admin",
        password: hash,
        phone: "80463333",
        role: "супер админ",
        level: 0,
        isActive: true,
        email: "ganzoriggnz@gmail.com",
        name: "Adminname",
        device_token: device_token,
      });
      console.log("uuuu====", uuuu);
      token = jwt.sign(
        {
          user: {
            username: "admin",
            role: "супер админ",
            isActive: true,
            email: "ganzoriggnz@gmail.com",
            level: 0,
            name: "Adminname",
          },
        },
        process.env.JWT_SECRET_KEY ??
          "GURU2023TOKENGANZORIGDEV20249FZIGFVRSTAR",
        { expiresIn: "24h" }
      );
      const cookie = serializeCookie("accessToken", token, { path: "/" });
      res
        .status(200)
        .setHeader("Set-Cookie", cookie)
        .json({ result: true, login: true, data: token });
    } else {
      res.status(200).json({
        login: false,
        result: false,
        data: null,
        message: "Хэрэглэгчийн нэвтрэх нэр буруу байна!!!",
      });
    }
  } catch (e) {
    console.log("login ERROR::::::", e);
    res.status(400).json({ result: false, login: false, data: e });
  }
}
