import { NextRequest } from "next/server";
import { HandlerContext } from "@/lib/server/params";
import { handleFormRequest } from "@/lib/pdf/route";

export async function GET(request: NextRequest, context: HandlerContext<{ matterId: string }>) {
  return handleFormRequest("p20", request, context);
}
