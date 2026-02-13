import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

console.log("[NEXTAUTH] Initializing NextAuth handler...");

const handler = NextAuth(authOptions);

// Wrap handlers with error catching
const wrappedGET = async (req: Request, context: any) => {
  console.log("[NEXTAUTH GET]", req.url);
  try {
    return await handler(req, context);
  } catch (error) {
    console.error("[NEXTAUTH GET ERROR]", error);
    throw error;
  }
};

const wrappedPOST = async (req: Request, context: any) => {
  console.log("[NEXTAUTH POST]", req.url);
  try {
    return await handler(req, context);
  } catch (error) {
    console.error("[NEXTAUTH POST ERROR]", error);
    throw error;
  }
};

export { wrappedGET as GET, wrappedPOST as POST };
