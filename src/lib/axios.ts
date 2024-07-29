import axios from "axios";
import { getCookie } from "cookies-next";
import { toast } from "react-toastify";

const BASE_URL = "/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

if (process.env.NEXT_PUBLIC_BASE_URL) {
  axiosInstance.defaults.baseURL = BASE_URL;
}

const currentToastIdTime = Math.floor(new Date().getTime() / 5000);

export const setAxiosBearerToken = (accessToken: string) => {
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken?.toString()}`;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error);
    // if (error.response.status == 401) {
    //   deleteCookie("accessToken");
    //   if (typeof window !== "undefined") window.open("/login");
    // }
    if (error.response?.data?.error && error.response.data.error.message) {
      toast.error(`${error.response.data.error.message}`, {
        toastId: `${error.response.data.error.message}${currentToastIdTime}`,
      });
    } else {
      toast.error(
        `Error Code : ${error.code} Error Message : ${error.message}`,
        {
          toastId: `${error.code}${currentToastIdTime}`,
        }
      );
    }
    return Promise.reject(
      (error.response && error.response.data) || "Something went wrong"
    );
  }
);

export default axiosInstance;

if (typeof window !== "undefined") {
  const accessToken = getCookie("accessToken");
  if (accessToken) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken?.toString()}`;
  }
}
