import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export type AuthUser = {
  _id: string;
  email: string;
  username: string;
  isVerified: boolean;
  isAcceptingMessage?: boolean;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: {
        identifier: string;
        password: string;
      }): Promise<any> {
        await dbConnect();

        const user = await UserModel.findOne({
          $or: [
            { email: credentials.identifier },
            { username: credentials.identifier },
          ],
        });

        if (!user) throw new Error("No user found with this email");
        if (!user.isVerified)
          throw new Error("Please verify your account before logging in");

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordCorrect) throw new Error("Incorrect password");

        if (user) {
          return {
            _id: user._id.toString(),
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
            isAcceptingMessage: user.isAcceptingMessage,
          };
        } else {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // JWT callback
    async jwt({ token, user }) {
      // user is returned from authorize
      if (user) {
        const authUser = user as AuthUser;
        token._id = authUser._id;
        token.username = authUser.username;
        token.email = authUser.email;
        token.isVerified = authUser.isVerified;
        token.isAcceptingMessage = authUser.isAcceptingMessage;
      }
      return token;
    },

    // Session callback
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id!;
        session.user.username = token.username!;
        session.user.email = token.email!;
        session.user.isVerified = token.isVerified!;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
      }
      return session;
    },
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/sign-in" },
};
