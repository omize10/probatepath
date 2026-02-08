import { NextResponse } from "next/server";
import { generatePDF } from "@/lib/forms-new/utils/pdf-generator";

export async function GET() {
  try {
    const html = `
      <html>
        <body>
          <h1>Chrome Test</h1>
          <p>If you see this as a PDF, Chrome is working!</p>
        </body>
      </html>
    `;
    
    const pdf = await generatePDF(html);
    
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=test.pdf",
      },
    });
  } catch (error: any) {
    console.error("Chrome test failed:", error);
    return NextResponse.json({
      error: "Chrome test failed",
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
