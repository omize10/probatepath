import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { ScheduleKind, type SupplementalSchedule } from "@prisma/client";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 40;
const LINE_HEIGHT = 16;

type SchedulePayload = Record<string, unknown>;

function formatAddress(payload: Record<string, string | null | undefined>) {
  const parts = [
    payload.addressLine1,
    payload.addressLine2,
    payload.city,
    payload.province,
    payload.postalCode,
    payload.country,
  ]
    .filter((part): part is string => Boolean(part && part.trim().length))
    .map((part) => part!.trim());
  return parts.join(", ") || "N/A";
}

export async function renderSchedulePdf(schedule: SupplementalSchedule) {
  const doc = await PDFDocument.create();
  const titleFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await doc.embedFont(StandardFonts.Helvetica);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let cursorY = PAGE_HEIGHT - MARGIN;

  const addPage = () => {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    cursorY = PAGE_HEIGHT - MARGIN;
  };

  const ensureSpace = (lines = 1) => {
    if (cursorY - lines * LINE_HEIGHT < MARGIN) {
      addPage();
    }
  };

  const writeLine = (text: string, size = 11, options: { bold?: boolean } = {}) => {
    ensureSpace();
    page.drawText(text, {
      x: MARGIN,
      y: cursorY,
      size,
      font: options.bold ? titleFont : bodyFont,
      color: options.bold ? rgb(0, 0, 0) : rgb(0.12, 0.12, 0.12),
    });
    cursorY -= LINE_HEIGHT;
  };

  writeLine(schedule.title, 18, { bold: true });
  cursorY -= LINE_HEIGHT / 2;
  if (schedule.description) {
    writeLine(schedule.description, 12);
    cursorY -= LINE_HEIGHT / 2;
  }

  const mutatePayload = (key: string) => {
    const raw = schedule.payload as SchedulePayload;
    return Array.isArray(raw[key]) ? raw[key] : [];
  };

  const renderExecutors = () => {
    const executors = mutatePayload("executors");
    if (!executors.length) return;
    writeLine("Additional executors:", 13, { bold: true });
    for (const executor of executors) {
      const entry = executor as Record<string, unknown>;
      ensureSpace(5);
      writeLine(`Name: ${entry.fullName ?? "Unnamed"}`);
      writeLine(`Role: ${entry.isAlternate ? "Alternate" : entry.isRenouncing ? "Renouncing" : "Executor"}`);
      writeLine(`Contact: ${entry.phone ?? "N/A"}`);
      writeLine(`Email: ${entry.email ?? "N/A"}`);
      writeLine(`Address: ${formatAddress(entry as Record<string, string | null | undefined>)}`);
      cursorY -= LINE_HEIGHT / 2;
    }
  };

  const renderDeceased = () => {
    const beneficiaries = mutatePayload("beneficiaries");
    if (!beneficiaries.length) return;
    writeLine("Deceased beneficiaries:", 13, { bold: true });
    for (const beneficiary of beneficiaries) {
      const entry = beneficiary as Record<string, unknown>;
      ensureSpace(6);
      writeLine(`Name: ${entry.fullName ?? "Unnamed"}`);
      writeLine(`Status: ${entry.status ?? "Unknown"}`);
      writeLine(`Relationship: ${entry.relationshipLabel ?? "N/A"}`);
      writeLine(`Share: ${entry.shareDescription ?? "N/A"}`);
      writeLine(`Representation: ${entry.representedById ?? "None"}`);
      writeLine(`Address: ${formatAddress(entry as Record<string, string | null | undefined>)}`);
      cursorY -= LINE_HEIGHT / 2;
    }
  };

  const renderMinors = () => {
    const minors = mutatePayload("minors");
    if (!minors.length) return;
    writeLine("Minor beneficiaries:", 13, { bold: true });
    for (const minor of minors) {
      const entry = minor as Record<string, unknown>;
      ensureSpace(6);
      writeLine(`Name: ${entry.fullName ?? "Unnamed"}`);
      writeLine(`DOB: ${entry.dateOfBirth ?? "Unknown"}`);
      writeLine(`Relationship: ${entry.relationshipLabel ?? "N/A"}`);
      writeLine(`Guardian: ${entry.representedById ?? "N/A"}`);
      writeLine(`Share: ${entry.shareDescription ?? "N/A"}`);
      writeLine(`Address: ${formatAddress(entry as Record<string, string | null | undefined>)}`);
      cursorY -= LINE_HEIGHT / 2;
    }
  };

  switch (schedule.kind) {
    case ScheduleKind.EXECUTORS:
      renderExecutors();
      break;
    case ScheduleKind.MINORS:
      renderMinors();
      break;
    case ScheduleKind.DECEASED_BENEFICIARIES:
      renderDeceased();
      break;
    default:
      writeLine("No additional notes.", 12);
  }

  return doc.save();
}

export async function renderSchedulePdfBuffer(schedule: SupplementalSchedule) {
  return await renderSchedulePdf(schedule);
}
