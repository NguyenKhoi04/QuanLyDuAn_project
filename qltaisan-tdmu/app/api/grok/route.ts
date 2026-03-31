import { NextResponse } from "next/server";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      messages?: ChatMessage[];
      model?: string;
      temperature?: number;
      max_tokens?: number;
    };

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: {
            message: "Missing XAI_API_KEY. Add it to your environment variables.",
            code: "MISSING_API_KEY",
          },
        },
        { status: 500 },
      );
    }

    const messages = body.messages ?? [];
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid request: 'messages' must be a non-empty array.",
            code: "INVALID_MESSAGES",
          },
        },
        { status: 400 },
      );
    }

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: body.model ?? "grok-4.20-reasoning",
        messages,
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 1024,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        {
          error: {
            message:
              (data as any)?.error?.message ??
              `Upstream error: ${response.status} ${response.statusText}`,
            status: response.status,
          },
          upstream: data,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("grok route error:", err);
    return NextResponse.json(
      { error: { message: "Unexpected server error." } },
      { status: 500 },
    );
  }
}