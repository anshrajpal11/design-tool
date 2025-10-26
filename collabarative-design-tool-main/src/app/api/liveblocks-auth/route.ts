import { Liveblocks } from "@liveblocks/node";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

const liveblocks = new Liveblocks({ secret: env.LIVEBLOCKS_SECRET_KEY });

export async function POST(req: Request) {
  const userSession = await auth();

  const user = await db.user.findUniqueOrThrow({
    where: { id: userSession?.user.id },
  });
  // read requested room from the incoming auth request (Liveblocks sends room info in the body)
  let requestedRoom = "test";
  try {
    const body = await req.json();
    if (body?.room) requestedRoom = String(body.room);
    if (body?.roomId) requestedRoom = String(body.roomId);
  } catch (e) {
    // ignore parse errors and fallback to test
  }

  const session = liveblocks.prepareSession(user.id, {
    // include richer user info so clients can show name/email/avatar
    // cast to any because the SDK typings only include `name` by default
    userInfo: {
      name: user.name ?? "Anonymous",
      email: user.email ?? undefined,
      id: user.id,
      image: user.image ?? undefined,
    } as any,
  });

  // scope the session to the requested room. Liveblocks may send either `test` or `room:test`
  const allowedRoom = String(requestedRoom).startsWith("room:")
    ? String(requestedRoom)
    : `room:${String(requestedRoom)}`;

  session.allow(allowedRoom, session.FULL_ACCESS);

  const { status, body } = await session.authorize();

  return new Response(body, { status });
}
