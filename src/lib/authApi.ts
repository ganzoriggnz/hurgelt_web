import axios from "axios";
import { setCookie } from "cookies-next";
import axiosInstance, { setAxiosBearerToken } from "./axios";

const authApi = {
  async loginViaGoogle(
    idToken: string
  ): Promise<{ jwt: string; isNew: number; email: string }> {
    const { data } = await axiosInstance.post(`/auth/googlelogin`, {
      idToken,
    });
    sessionStorage.setItem("ACCESS_TOKEN_SESSION_STORAGE_KEY", data.jwt);
    return data;
  },
  async loginViaGooglecustom(
    idToken: string,
    device_token: string
  ): Promise<{ jwt: string; isNew: number; email: string }> {
    const { data } = await axiosInstance.post(`/auth/googlelogincustom`, {
      idToken,
      device_token,
    });
    setCookie("accessToken", data.jwt, { maxAge: 72 * 3600 });
    setAxiosBearerToken(data.jwt);
    sessionStorage.setItem("ACCESS_TOKEN_SESSION_STORAGE_KEY", data.jwt);
    return data;
  },

  async loginViaGoogleRevoke(idToken: string): Promise<any> {
    console.log("Google-ийн revoked:[1] ", idToken);
    let postData = "token=" + idToken;
    const googleOAuth = await axios.request({
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
      url: `https://oauth2.googleapis.com/revoke?id_token=${idToken}`,
    });
    console.log("Google-ийн revoked: [2] ", googleOAuth);
    if (googleOAuth) {
      console.log("Google-ийн SUCCUESS: [3]");
    }

    return googleOAuth;
  },
};

export default authApi;
