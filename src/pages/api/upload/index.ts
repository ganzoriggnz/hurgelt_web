import serverPath from "@/helper/path";
import ffmpeg from "fluent-ffmpeg";
import { Formidable } from "formidable";
import fs from "fs";
import convert from "heic-convert";
import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import path from "path";
import sharp from "sharp";
import { promisify } from "util";

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
//set bodyparser
export const config = {
  api: {
    bodyParser: false,
  },
};
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
  const dirname = serverPath("/public/uploads/");
  let returningFiles: any[] = [];

  await new Promise((resolve, reject) => {
    const form = new Formidable();
    // console.log("STEP: 2", form);
    ffmpeg.setFfprobePath(ffprobePath);
    ffmpeg.setFfmpegPath(ffmpegPath);

    form.parse(req, async (err, fields, files: any) => {
      if (err) reject({ err });
      if (files && files != undefined && files.file && files.file.length > 0) {
        for (let index = 0; index < files.file.length; index++) {
          const file = files.file[index];
          if (!file?.mimetype?.includes("image")) {
            return res.status(201).json({ message: "not image!!!" });
          }
          var filesizes = file.size;
          const extdd = file?.originalFilename?.slice(
            file?.originalFilename?.lastIndexOf(".") + 1,
            file?.originalFilename?.length
          );
          try {
            if (extdd === "gif") {
              const filname = file.newFilename + ".png";
              await sharp(file.filepath).toFile(
                path.resolve(dirname, "org", filname)
              );
              await sharp(file.filepath)
                .rotate()
                .resize(400, 800, {
                  fit: sharp.fit.inside,
                  withoutEnlargement: true,
                })
                .withMetadata()
                .png()
                .toFile(path.resolve(dirname, path.basename(filname)));
              try {
                fs.unlinkSync(file.filepath);
              } catch (e) {
                console.log(e);
              }
              returningFiles.push({
                fileName: filname,
                type: "png",
                size: filesizes,
                url: `/uploads/${filname}`,
                org: `/uploads/org/${filname}`,
              });
            } else if (extdd == "heic") {
              try {
                const filname = file.newFilename + ".jpg";
                const inputBuffer = await promisify(fs.readFile)(file.filepath);
                const outputBuffer: ArrayBuffer = await convert({
                  buffer: inputBuffer,
                  format: "JPEG",
                  quality: 1,
                });
                await fs.appendFileSync(
                  file.filepath + ".jpg",
                  Buffer.from(outputBuffer)
                );
                await sharp(file.filepath).toFile(
                  path.resolve(dirname, "org", filname)
                );
                try {
                  fs.unlinkSync(file.filepath);
                } catch (e) {
                  console.log(e);
                }
                returningFiles.push({
                  fileName: file.filepath + ".jpg",
                  type: "jpg",
                  size: filesizes,
                  url: `/uploads/${file.filepath + ".jpg"}`,
                  org: `/uploads/org/${file.filepath + ".jpg"}`,
                });
              } catch (eeee) {
                console.log("heic file error to jpg converted!");
                const filname = file.newFilename + ".jpg";
                await sharp(file.filepath).toFile(
                  path.resolve(dirname, "org", filname)
                );
                try {
                  fs.unlinkSync(file.filepath);
                } catch (e) {
                  console.log(e);
                }
                returningFiles.push({
                  fileName: file.filepath + ".jpg",
                  type: "jpg",
                  size: filesizes,
                  url: `/uploads/${file.filepath + ".jpg"}`,
                  org: `/uploads/org/${file.filepath + ".jpg"}`,
                });
              }
            } else {
              const filname = file.newFilename + ".jpg";
              await sharp(file.filepath)
                .rotate()
                .withMetadata()
                .jpeg({ quality: 100 })
                .toFile(path.resolve(dirname, "org", filname));
              await sharp(file.filepath)
                .rotate()
                .resize(400, 800, {
                  fit: sharp.fit.inside,
                  withoutEnlargement: true,
                })
                .withMetadata()
                .toFile(path.resolve(dirname, filname));
              try {
                fs.unlinkSync(file.filepath);
              } catch (e) {
                console.log(e);
              }
              returningFiles.push({
                fileName: filname,
                type: "jpg",
                size: filesizes,
                url: `/uploads/${filname}`,
                org: `/uploads/org/${filname}`,
              });
            }
            return res.status(200).json({
              result: true,
              message: "Амжилттай хуулагдлаа.",
              data: returningFiles,
            });
          } catch (e) {
            console.log("ERROR sharp :::::::::::::::::", e);
          }
        }
      }
      return res.status(201).json({
        message: "file not found",
      });
    });
  });
}
