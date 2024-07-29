import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyJwtToken } from "./lib";

const pagesPath: string[] = [
  "/",
  "/products",
  "/profile",
  "/orders",
  "/users",
  "/customers",
  "/settings/deliveryzones",
  "/invioces",
  "/warehouse",
  "/reports/jolooch",
  "/reports",
];

const apiTokenpath: string[] = [
  "/api/customers",
  "/api/customers/getcustomers",
  "/api/customers/register",
  "/api/customers/delete",
  "/api/customers/update",
  "/api/customers/customerinfo",
  // "/api/deliveryzone", // get zones unauth
  "/api/deliveryzone/getzones",
  "/api/deliveryzone/add",
  "/api/deliveryzone/edit",
  "/api/deliveryzone/delete",
  // "/api/deliveryzone/getjoloochzone",
  "/api/users",
  "/api/users/getusers",
  "/api/users/getusersselect",
  "/api/users/register",
  "/api/users/delete",
  "/api/users/update",
  "/api/users/balanceupdate",
  "/api/products",
  // "/api/products/getproducts",
  "/api/profile",
  // "/api/auth/logout",
  "/api/auth/changepass",
  "/api/reports",
  "/api/reports/sales",
  "/api/reports/uldegdel",
  "/api/reports/duntailan",
  "/api/jolooch/",
  "/api/jolooch/location",
  "/api/jolooch/balanceend",
  "/api/jolooch/balance",
  "/api/jolooch/orders",
  "/api/jolooch/ordersall",
  "/api/jolooch/orderupdate",
  "/api/jolooch/orderpaid",
  "/api/jolooch/orderchange",
  "/api/jolooch/orderchangeupdate",
  "/api/jolooch/orderfieldupdate",
  "/api/jolooch/orderjoloochupdate",
  "/api/jolooch/invoiceconfirm",
  "/api/jolooch/orlogo",
  "/api/jolooch/reorder",
  "/api/jolooch/getorlogostushaalt",
  "/api/orders",
  "/api/invoice/",
  "/api/invoice/getuserinvoice",
  "/api/invoice/add",
  "/api/invoice/delete",
  "/api/orders/",
  "/api/orders/add",
  "/api/upload/",
  "/api/updateuser/",
  "/api/orders/ordercancel",
  "/api/orders/orderrestore",
  "/api/orders/joloochtodayproducts",
  "/api/orders/jolooch",
  "/api/orders/update",
  "/api/orders/delete",
  "/api/orders/getorder",
  "/api/orders/joloochtsalin",
  "/api/orders/checktodaycustomer",
];

export default async function middleware(request: NextRequest) {
  const authSession = request.cookies.get("accessToken")?.value?.toString();
  const token = request.headers
    .get("Authorization")
    ?.split("Bearer ")
    .at(1)
    ?.toString();
  const pathReq = request.nextUrl.pathname;
  console.log(pathReq);
  let clientData;

  if (authSession) {
    clientData = jwt.decode(authSession);
  }

  if (["/login"].includes(request.nextUrl.pathname)) {
    if (authSession) {
      try {
        const object: any = await verifyJwtToken(authSession);
        if (object) {
          return NextResponse.redirect(new URL("/", request.url));
        } else {
          return NextResponse.next();
        }
      } catch (e) {
        return NextResponse.next();
      }
    } else return NextResponse.next();
  } else if (pagesPath.includes(request.nextUrl.pathname)) {
    if (!authSession) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      return response;
    } else {
      try {
        const object: any = await verifyJwtToken(authSession);
        if (object) return NextResponse.next();
        else {
          const response = NextResponse.redirect(
            new URL("/login", request.url)
          );
          console.log(
            "[DELETE COOKIE][1] [accessToken]",
            request.nextUrl.pathname
          );
          response.cookies.delete("accessToken");
          return response;
        }
      } catch (e) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        // response.cookies.delete("accessToken");
        console.log(
          "[DELETE COOKIE][2] [accessToken]",
          request.nextUrl.pathname
        );

        return response;
      }
    }
  } else if (
    apiTokenpath.includes(request.nextUrl.pathname) &&
    request.method != "OPTIONS"
  ) {
    console.log("METHOD:", request.method);
    const authToken = await verifyJwtToken(token?.toString());
    if (authToken) {
      return NextResponse.next();
    } else {
      console.log("Auth required");
      return NextResponse.json({ message: "Auth required" }, { status: 401 });
    }
  }
  return NextResponse.next();
}
