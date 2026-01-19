import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin/auth";
import puppeteer from "puppeteer";
import Handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";
import { HandlerContext, resolveContextParams } from "@/lib/server/params";

// Helper to format dates
function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

// Helper to split deceased name
function splitDeceasedName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], middleNames: "", lastName: "" };
  } else if (parts.length === 2) {
    return { firstName: parts[0], middleNames: "", lastName: parts[1] };
  } else {
    return {
      firstName: parts[0],
      middleNames: parts.slice(1, -1).join(" "),
      lastName: parts[parts.length - 1],
    };
  }
}

// Helper to get full address from executor
function formatAddress(executor: any): string {
  const parts = [
    executor.addressLine1,
    executor.addressLine2,
    executor.city,
    executor.province,
    executor.postalCode,
  ].filter(Boolean);
  return parts.join(", ");
}

// Transform Prisma matter data to P9 template format
function transformMatterToP9(matter: any) {
  const primaryExecutor =
    matter.executors.find((e: any) => e.isPrimary) || matter.executors[0];
  const deceasedName = splitDeceasedName(matter.draft?.decFullName || "");

  // Get all beneficiaries as delivery recipients
  // Default to mail delivery for all beneficiaries
  const mailRecipients = matter.beneficiaries.map((b: any) => ({
    name: b.fullName,
    date: formatDate(new Date()),
  }));

  return {
    // Section 1: Affidavit Information
    affidavitNumber: "2nd",
    deponentName: primaryExecutor?.fullName || matter.draft?.exFullName || "",
    affidavitDate: "", // Leave blank - filled when sworn
    commissionerLocation: `${primaryExecutor?.city || matter.draft?.exCity || "Vancouver"}, British Columbia`,
    commissionerCity: primaryExecutor?.city || matter.draft?.exCity || "Vancouver",
    commissionerProvince: "British Columbia",
    videoConference: false,

    // Section 2: File Information
    registryName: matter.registryName || "Vancouver",
    fileNumber: matter.caseCode || "",

    // Section 3: Deliverer Information
    delivererName: primaryExecutor?.fullName || matter.draft?.exFullName || "",
    delivererAddress: primaryExecutor
      ? formatAddress(primaryExecutor)
      : matter.draft?.exCity || "",
    delivererOccupation: "Executor",
    documentsDelivered: matter.draft?.hadWill
      ? "Copy of the Will; Death Certificate"
      : "Death Certificate",

    // Section 4: Deceased Information
    deceased: {
      firstName: deceasedName.firstName,
      middleNames: deceasedName.middleNames,
      lastName: deceasedName.lastName,
    },

    // Section 5: Delivery methods
    deliveryByMail: {
      used: mailRecipients.length > 0,
      recipients: mailRecipients,
    },
    deliveryByHand: {
      used: false,
      recipients: [],
    },
    deliveryByElectronic: {
      used: false,
      recipients: [],
    },
    electronicAcknowledgementReceived: false,
    willRetainAcknowledgements: false,

    // Section 6: Delivery on behalf
    deliveryOnBehalf: [],

    // Section 7: PGT Delivery
    pgtDelivery: {
      byMail: matter.beneficiaries.some((b: any) => b.isMinor),
      byHand: false,
      byElectronic: false,
    },

    // Section 8: Electronic Will
    electronicWill: {
      noDemand: true,
      provided: false,
      providedTo: "",
    },

    // Section 9: Additional Information
    additionalInformation: "",
  };
}

export async function GET(
  request: NextRequest,
  context: HandlerContext<{ matterId: string }>
) {
  try {
    const { matterId } = await resolveContextParams(context);

    // Auth check
    const cookieStore = await cookies();
    const opsPass = cookieStore.get("ops_auth")?.value;
    const opsAllowed = opsPass === "1";

    const { session } = await getServerAuth();
    const user = session?.user as { id?: string } | undefined;
    const userId = user?.id;
    const admin = isAdmin(session ?? null);

    if (!userId && !opsAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch matter with all relations
    const matter = await prisma.matter.findFirst({
      where: admin || opsAllowed ? { id: matterId } : { id: matterId, userId },
      include: {
        draft: true,
        executors: { orderBy: { orderIndex: "asc" } },
        beneficiaries: true,
        schedules: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!matter) {
      return NextResponse.json({ error: "Matter not found" }, { status: 404 });
    }

    // Transform data to P9 format
    const p9Data = transformMatterToP9(matter);

    // Load and compile template
    const templatePath = path.join(process.cwd(), "templates", "P9.html");
    const templateSource = await fs.readFile(templatePath, "utf8");
    const template = Handlebars.compile(templateSource);
    const html = template(p9Data);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: {
        top: "0.6in",
        right: "0.75in",
        bottom: "0.6in",
        left: "0.75in",
      },
    });

    await browser.close();

    // Return PDF
    const downloadParam = request.nextUrl.searchParams.get("download");
    const disposition = downloadParam === "1" ? "attachment" : "inline";
    const lastName = matter.draft?.decFullName?.split(" ").pop() || "Unknown";

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="P9-${lastName}-Affidavit-of-Delivery.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating P9:", error);
    return NextResponse.json(
      { error: "Failed to generate P9", details: error.message },
      { status: 500 }
    );
  }
}
