import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid message format." }, { status: 400 });
    }

    // Inject the system persona so the AI knows its role
    const systemPrompt = {
      role: "system",
      content: "You are the BodySync AI coach, an elite fitness and nutrition expert. Provide concise, highly actionable advice. Maintain a highly motivating, analytical, and professional tone."
    };

    const completion = await groq.chat.completions.create({
      messages: [systemPrompt, ...messages],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7, // Slightly higher than the JSON generator for natural conversation
    });

    const reply = completion.choices[0]?.message?.content;

    return NextResponse.json({ reply });

  } catch (error: unknown) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Communication with the AI coach failed." },
      { status: 500 }
    );
  }
}