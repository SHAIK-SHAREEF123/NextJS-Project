import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: { identifier: string; password: string }): Promise<User | null> {
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

        // ✅ Return plain object with correct _id as string
        return {
          _id: user._id.toString(),
          email: user.email,
          username: user.username,
          isVerified: user.isVerified,
          isAcceptingMessage: user.isAcceptingMessage,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.username = user.username;
        token.email = user.email;
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessage;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
      }
      return session;
    },
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/sign-in" },
};
