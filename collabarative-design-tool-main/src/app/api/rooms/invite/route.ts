import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { roomId, email } = body || {};
  if (!roomId || !email) return NextResponse.json({ error: "Missing roomId or email" }, { status: 400 });

  // verify room exists and requester is a member/owner
  const room = await (db as any).room.findUnique({ where: { id: String(roomId) } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  // create invite token
  const token = randomBytes(6).toString("hex");

  const invite = await (db as any).invite.create({
    data: {
      roomId: room.id,
      email: String(email).toLowerCase(),
      token,
      inviterId: session.user.id,
    },
  });

  // TODO: send email with invite link (out of scope here)

  return NextResponse.json({ invite });
}
