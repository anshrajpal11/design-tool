import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json(
      { error: "roomId query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const commits = await db.commit.findMany({
      where: { roomId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ commits });
  } catch (error) {
    console.error("Failed to fetch commits", error);
    return NextResponse.json(
      { error: "Failed to fetch commits" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();

    const { roomId, name, state, pngBase64 } = body ?? {};

    if (!roomId || !name || !state) {
      return NextResponse.json(
        { error: "roomId, name, and state are required" },
        { status: 400 },
      );
    }

    let parsedState: unknown = state;
    if (typeof state === "string") {
      try {
        parsedState = JSON.parse(state);
      } catch (error) {
        console.error("Invalid state JSON", error);
        return NextResponse.json(
          { error: "Invalid state payload" },
          { status: 400 },
        );
      }
    }

    const commit = await db.commit.create({
      data: {
        roomId,
        name,
        state: parsedState as any,
        pngBase64: typeof pngBase64 === "string" ? pngBase64 : null,
        createdById: session?.user.id,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ commit }, { status: 201 });
  } catch (error) {
    console.error("Failed to create commit", error);
    return NextResponse.json(
      { error: "Failed to create commit" },
      { status: 500 },
    );
  }
}
