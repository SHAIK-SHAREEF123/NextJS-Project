import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);
  // console.log("Session in GET:", session);

  if (!session || !session.user?.email) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    // Fetch user again using email (more reliable than session._id)
    const user = await UserModel.findOne({ email: session.user.email }).select("messages");

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const sortedMessages = user.messages
      ? [...user.messages].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )
      : [];

    return Response.json(
      { success: true, messages: sortedMessages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
