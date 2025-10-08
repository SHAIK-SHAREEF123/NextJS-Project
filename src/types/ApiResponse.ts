import { Message } from "@/model/User";

export interface ApiResponse{
    success: boolean;
    message: string;
    isAcceptionMessages?: boolean
    messages?: Array<Message>
}