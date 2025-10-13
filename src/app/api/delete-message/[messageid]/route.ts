import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, {params}: {params: {messageid: string}}) {
    const messageId = params.messageid;
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if(!session || !session.user) {
        return NextResponse.json({success: false,message: "Not Authenticated"},{status: 401})
    }

    try {
        const updatedResult = await UserModel.updateOne({_id: user._id}, {$pull: {messages: {_id: messageId}}})
        if(updatedResult.modifiedCount == 0) {
            return NextResponse.json({success: false, message: "Message not found or Message already deleted"},{status: 404})
        }
        return NextResponse.json({success: true, message: "Message Deleted Successfully"},{status: 200});
    } catch (error) {
        console.error("Error occur during deleting a message",error);
        return NextResponse.json({success: false, message: "Error deleting Message"},{status: 500});
        
    }
    
}