import dbConnect from "@/lib/dbConnect";
import clientPromise from "@/lib/mongodb";
import UserModel from "@/models/users.model";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: {
          label: "username",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        await dbConnect();
        const userTemp: any = await UserModel.findOne({
          $or: [
            { username: credentials?.username },
            { phone: credentials?.username },
            { email: credentials?.username },
          ],
        });
        if (userTemp) {
          userTemp.password = "";
          return userTemp;
        }
        return null;
      },
    }),
  ],

  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // console.log("user===", user);
      // console.log("account===", account);
      // console.log("profile===", profile);
      // console.log("email===", email);
      // console.log("credentials===", credentials);
      return true;
    },
    async session({ session, token, user }) {
      // console.log("user::::::", user);
      // console.log("session::::::", session);
      // console.log("token::::::", token);
      session.accessToken = token.accessToken as string;
      session.user = user;
      return session;
    },
    async jwt({ token, user, account, session }) {
      // console.log("user*********", user);
      // console.log("account*********", account);
      // console.log("session*********", session);
      // console.log("token*********", token);
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.user = user;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === "production",
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt", maxAge: 1 * 24 * 60 * 60 },
  jwt: { secret: process.env.JWT_SECRET_KEY },
  secret: process.env.JWT_SECRET_KEY,
});
