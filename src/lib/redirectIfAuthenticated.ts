/* eslint-disable max-len */
import { jwtVerify } from "jose";
import { GetServerSideProps } from "next";
import { PreviewData } from "next/types";
import { ParsedUrlQuery } from "querystring";

type RedirectIfAuthenticated = <
  P extends { [key: string]: unknown } = { [key: string]: unknown },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
>(
  gssp: GetServerSideProps<P, Q, D>
) => GetServerSideProps<P, Q, D>;

/**
 * Use with `GetServerSideProps`
 * eg:
 * ```
 * export const getServerSideProps: GetServerSideProps<Props> = redirectIfAuthenticated(async (context) => {
 *   ...
 * })
 * ```
 */
export const redirectIfAuthenticated: RedirectIfAuthenticated =
  (gssp) => async (context) => {
    const { auth: authSession } = context.req.cookies;
    if (authSession) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    return gssp(context); // Continue on to call `getServerSideProps` logic
  };

function getJwtSecretKey() {
  const secret =
    process.env.JWT_SECRET_KEY ?? "GURU2023TOKENGANZORIGDEV20249FZIGFVRSTAR";
  if (!secret) {
    throw new Error("JWT Secret key is not matched");
  }
  return new TextEncoder().encode(secret);
}

export async function verifyJwtToken(token: any) {
  try {
    // console.log("verifyJwtToken :::: ",token);
    const payload = await jwtVerify(token, getJwtSecretKey());
    return payload;
  } catch (error) {
    console.log("error verifyJwtToken :::: ", token);
    console.log(error);
    return null;
  }
}
