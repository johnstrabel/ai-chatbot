import { NextResponse } from "next/server";
import { OpenAI } from "openai";

// Debugging: Log API Key
console.log("🔑 OPENAI_API_KEY:", process.env.OPENAI_API_KEY || "❌ Not Found");

if (!process.env.OPENAI_API_KEY) {
  throw new Error("❌ Missing OpenAI API key");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
      });      

    return NextResponse.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 });
  }
}
