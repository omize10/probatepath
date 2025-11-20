import { NextRequest, NextResponse } from "next/server";

export function sendPdfResponse(bytes: Uint8Array, request: NextRequest, filename: string) {
  const download = request.nextUrl.searchParams.get("download") === "1";
  const disposition = download ? "attachment" : "inline";
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${filename}"`,
    },
  });
}
