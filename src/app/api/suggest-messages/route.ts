import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(_req: Request) {
  try {
    const prompt = `Create a list of three open-ended and engaging questions formatted as a single string. 
Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, 
and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes 
that encourage friendly interaction. For example, your output should be structured like this: 
"What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||
What's a simple thing that makes you happy?" 
Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.`;

    const result = await streamText({
      model: openai("gpt-4o"),
      prompt, // ✅ using prompt directly instead of messages
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    if (error.name === "APIError") {
      return new Response(
        JSON.stringify({
          error: "OpenAI API Error",
          message: error.message,
        }),
        { status: error.status ?? 500 }
      );
    }

    console.error("Unexpected Error:", error);
    return new Response(
      JSON.stringify({
        error: "Unexpected Server Error",
        message: error.message || "Something went wrong",
      }),
      { status: 500 }
    );
  }
}
