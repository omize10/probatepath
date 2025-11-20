import { NextRequest } from "next/server";
import { handleFormRequest } from "@/lib/pdf/route";
import { HandlerContext } from "@/lib/server/params";

export async function GET(request: NextRequest, context: HandlerContext<{ matterId: string }>) {
  return handleFormRequest("will-search", request, context);
}
