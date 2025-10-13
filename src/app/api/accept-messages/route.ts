import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "@/model/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Not Authenticated" },
      { status: 401 }
    );
  }

  const userId = user._id;
  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true }
    );
    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update user status to accept messages",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message acceptance status updated successfully",
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Failed to update user status to accept messages");
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user status to accept messages",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Not Authenticated" },
      { status: 401 }
    );
  }

  const userId = user._id;

  try {
    const foundUser = await UserModel.findOne({ userId });
    if (!foundUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not Found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: "Accepting Message", isAcceptingMessage: foundUser.isAcceptingMessage },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in getting the Message Acceptance status");
    NextResponse.json({success: false, message: "Error in getting the Message Acceptance status"},{status: 500})
  }
}
