import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  // Extract messageid from URL
  const url = new URL(req.url);
  const segments = url.pathname.split("/"); // ["", "api", "delete-message", "messageid"]
  const messageid = segments[segments.length - 1];

  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  const user = session.user;

  try {
    const updatedResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageid } } }
    );

    if (updatedResult.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Message not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting message" },
      { status: 500 }
    );
  }
}
