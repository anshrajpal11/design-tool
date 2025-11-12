import { NextResponse } from "next/server";
import { env } from "~/env";

// Use gemma-3-12b-it via the v1beta API
const GEMINI_MODEL = "gemma-3-12b-it";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function POST(request: Request) {
  if (!env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API key is not configured." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { state } = body ?? {};

    if (!state) {
      return NextResponse.json(
        { error: "Canvas state is required." },
        { status: 400 },
      );
    }

    const stateString = JSON.stringify(state);
    const prompt = [
      "Act as a product designer summarizing the current collaborative canvas for teammates.",
      "Read the canvas JSON and describe the overall intent and feel in 2–3 plain sentences.",
      "Do NOT list raw coordinates, pixel sizes, RGB values, or implementation details.",
      "Focus on what the audience would perceive: key elements, tone, and layout impression.",
      "",
      "Canvas JSON:",
      stateString,
    ].join("\n");

    const response = await fetch(
      `${GEMINI_ENDPOINT}?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topP: 0.95,
            maxOutputTokens: 512,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      console.error("Gemini API error", errorPayload);
      const apiMessage =
        (errorPayload as any)?.error?.message ?? "Gemini API request failed.";
      return NextResponse.json({ error: apiMessage }, { status: 502 });
    }

    const data = await response.json();
    const summary =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part?.text ?? "")
        .join("\n")
        .trim() ?? "";

    if (!summary) {
      return NextResponse.json(
        { error: "Gemini did not return a summary." },
        { status: 502 },
      );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Canvas summary error", error);
    return NextResponse.json(
      { error: "Failed to generate canvas summary." },
      { status: 500 },
    );
  }
}
