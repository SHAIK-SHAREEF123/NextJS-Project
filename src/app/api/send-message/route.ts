import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";

import { Message } from "@/model/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await dbConnect();

    const {username,content} = await request.json();

    try {
        const user = await UserModel.findOne({username});
        if(!user) {
            return NextResponse.json({success: false, message: "User not Found"},{status: 404});
        }

        //is user accepting messages
        if(!user.isAcceptingMessage) {
            return NextResponse.json({success: false, message: "User is not accepting any messages"},{status: 403});
        }

        const newMessage = {content: content,createdAt : new Date()};
        user.messages.push(newMessage as Message);
        await user.save();
        return NextResponse.json({success: true, message: "Message sent successfully"},{status: 200});
    } catch (error) {
        console.error("An unexpected error occured in sending message", error);
        return NextResponse.json({success: false, message: "Error in sending message"},{status: 500});
    }
}