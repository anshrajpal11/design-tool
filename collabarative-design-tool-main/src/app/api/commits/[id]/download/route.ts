import { Buffer } from "buffer";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const commitId = params.id;

  if (!commitId) {
    return NextResponse.json({ error: "Missing commit id" }, { status: 400 });
  }

  try {
    const commit = await db.commit.findUnique({
      where: { id: commitId },
      select: { name: true, pngBase64: true },
    });

    if (!commit) {
      return NextResponse.json({ error: "Commit not found" }, { status: 404 });
    }

    if (!commit.pngBase64) {
      return NextResponse.json(
        { error: "This commit does not have an associated PNG" },
        { status: 404 },
      );
    }

    const dataUrl = commit.pngBase64;
    let base64Data = dataUrl;
    let contentType = "image/png";

    const match = /^data:(.+);base64,(.*)$/.exec(dataUrl);
    if (match) {
      contentType = match[1] ?? "image/png";
      base64Data = match[2] ?? "";
    }

    if (!base64Data) {
      return NextResponse.json(
        { error: "PNG data is corrupted" },
        { status: 500 },
      );
    }

    const buffer = Buffer.from(base64Data, "base64");
    const safeName = `${commit.name || "canvas"}`.replace(/[^\w.-]+/g, "_");

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeName}.png"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Failed to download commit PNG", error);
    return NextResponse.json(
      { error: "Failed to download commit PNG" },
      { status: 500 },
    );
  }
}
