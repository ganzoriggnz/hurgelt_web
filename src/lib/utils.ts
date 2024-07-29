import axios from "axios";
const https = require("https");

export const validateEmail = (email: string): boolean => {
  const regEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return regEx.test(email);
};

const GOOGLE_IDENTITY_URL = "https://oauth2.googleapis.com/tokeninfo";

export const GOOGLE_CLIENT_Secret = "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";
export const GOOGLE_CLIENT_ID =
  "364857935332-c9rmvkcud581ne3rlrtp7lrk4i1d82mv.apps.googleusercontent.com";

export const authorizeGoogle = async (idToken: string) => {
  const googleOAuth = await axios.request({
    method: "GET",
    url: `${GOOGLE_IDENTITY_URL}?id_token=${idToken}`,
  });

  const { name, email, picture } = googleOAuth.data;

  return { name, email, picture };
};

export const authorizeGoogleCustom = async (idToken: string) => {
  const googleOAuth = await axios.request({
    method: "GET",
    url: `https://www.googleapis.com/oauth2/v3/userinfo`,
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  console.log("googleOAuth.data ::: ", googleOAuth.data);
  const { name, email, picture } = googleOAuth.data;
  return { name, email, picture };
};

export const authApple = async (id_token: string) => {
  try {
    return id_token;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const logOutViaGoogleRevokeHttps = async (idToken: string) => {
  const postData: string = "token=" + idToken;
  let postOptions = {
    host: "oauth2.googleapis.com",
    port: "443",
    path: "/revoke",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
    },
  };
  // Set up the request
  const postReq = https.request(postOptions, function (res: any) {
    res.setEncoding("utf8");
    res.on("data", (d: any) => {
      console.log("Response: " + d);
    });
  });
  postReq.on("error", (error: any) => {
    console.log(error);
  });
  postReq.write(postData);
  postReq.end();
};
export const logOutViaGoogleRevokeAxios = async (idToken: string) => {
  try {
    await axios.post(
      "https://oauth2.googleapis.com/revoke",
      {
        token: idToken,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  } catch (error) {
    console.log("ERROR:::: logOutViaGoogleRevokeAxios::", error);
  } finally {
    return true;
  }
};
