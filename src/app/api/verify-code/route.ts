import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    await dbConnect();

    try {
        const {username,code} = await request.json();
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({username: decodedUsername});
        if(!user) {
             return NextResponse.json({success: false, message: "No user found with that username"},{status: 500})
        }

        const isCodeValid = user.verifyCode === code; 
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if(isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();
            return NextResponse.json({success: true, message: "Account Verified Successfully"},{status: 200});
        } else if(!isCodeNotExpired) {
            return NextResponse.json({success: false, message: "Your verification code has expired,Please signup again to get new code"},{status: 400});
        } 
        else{
            return NextResponse.json({success: false, message: "Incorrect Verification Code"},{status: 400});
        }


    } catch (error) {
        console.error("Error in Verification of Code",error);
        return NextResponse.json({success: false, message: "Error verifying Code"},{status: 500})
    }
}