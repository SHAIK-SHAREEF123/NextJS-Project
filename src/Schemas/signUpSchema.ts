import {z} from "zod";

export const usernameValidation = z
    .string()
    .min(2, "Username must be atleat 2 Characters")
    .max(20, "Username must be no more than 20 characters long")

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: "Invalid Email Address"}),
    password: z.string().min(6, {message: "Password must be atleat 6 characters"}),
})