import {
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  ShadingType,
  ITableCellBorders,
} from "docx";

// Checkbox display - uses [X] for checked, [ ] for unchecked
export function checkbox(checked: boolean): string {
  return checked ? "[X]" : "[ ]";
}

// Dotted line for blank fields
export function line(chars: number = 40): string {
  return ".".repeat(chars);
}

// Underline for signature lines
export function underline(chars: number = 40): string {
  return "_".repeat(chars);
}

// Format an address object into a single string
export function formatAddress(addr: {
  streetNumber?: string;
  streetName?: string;
  poBox?: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
}): string {
  const parts: string[] = [];
  if (addr.poBox) {
    parts.push(`P.O. Box ${addr.poBox}`);
  } else {
    if (addr.streetNumber && addr.streetName) {
      parts.push(`${addr.streetNumber} ${addr.streetName}`);
    } else if (addr.streetName) {
      parts.push(addr.streetName);
    }
  }
  parts.push(addr.city);
  parts.push(addr.province);
  parts.push(addr.country);
  parts.push(addr.postalCode);
  return parts.filter(Boolean).join(", ");
}

// Create a standard paragraph
export function p(
  text: string | TextRun[],
  options?: {
    bold?: boolean;
    italic?: boolean;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spacing?: { before?: number; after?: number };
    indent?: { left?: number; hanging?: number; firstLine?: number };
    size?: number;
  }
): Paragraph {
  const runs =
    typeof text === "string"
      ? [
          new TextRun({
            text,
            bold: options?.bold,
            italics: options?.italic,
            size: options?.size || 22,
            font: "Arial",
          }),
        ]
      : text;

  return new Paragraph({
    children: runs,
    alignment: options?.alignment,
    spacing: options?.spacing || { after: 120 },
    indent: options?.indent,
  });
}

// Create a bold paragraph
export function boldP(text: string, options?: { spacing?: { before?: number; after?: number }; alignment?: (typeof AlignmentType)[keyof typeof AlignmentType] }): Paragraph {
  return p(text, { bold: true, ...options });
}

// Create centered text
export function centered(text: string, options?: { bold?: boolean; size?: number }): Paragraph {
  return p(text, { alignment: AlignmentType.CENTER, bold: options?.bold, size: options?.size });
}

// Create a section header with gray shading
export function sectionHeader(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, font: "Arial" })],
    shading: { type: ShadingType.SOLID, color: "D3D3D3" },
    spacing: { before: 240, after: 120 },
  });
}

// Create a paragraph with checkbox
export function checkboxP(checked: boolean, text: string, options?: { indent?: number; spacing?: { before?: number; after?: number } }): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${checkbox(checked)} `, size: 22, font: "Arial" }),
      new TextRun({ text, size: 22, font: "Arial" }),
    ],
    spacing: options?.spacing || { after: 120 },
    indent: options?.indent ? { left: options.indent } : undefined,
  });
}

// Create a field row: "Label: value" or "Label: ........"
export function fieldRow(label: string, value?: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, size: 22, font: "Arial" }),
      new TextRun({ text: value || line(30), size: 22, font: "Arial" }),
    ],
    spacing: { after: 100 },
  });
}

// Create signature block
export function signatureBlock(options?: { showDate?: boolean }): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  if (options?.showDate !== false) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Date: ${line(20)}`, size: 22, font: "Arial" }),
        ],
        spacing: { before: 360, after: 240 },
      })
    );
  }

  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: underline(50), size: 22, font: "Arial" })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Signature of ", size: 20, font: "Arial" }),
        new TextRun({ text: `${checkbox(false)} applicant  ${checkbox(false)} lawyer for applicant(s)`, size: 20, font: "Arial" }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: underline(50), size: 20, font: "Arial" })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "[type or print name]", size: 20, font: "Arial", italics: true })],
      spacing: { after: 120 },
    })
  );

  return paragraphs;
}

// Create jurat (sworn statement block)
export function juratBlock(deponentName: string, location?: string): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({ text: "SWORN (OR AFFIRMED) before me at ", size: 22, font: "Arial" }),
        new TextRun({ text: location || line(20), size: 22, font: "Arial" }),
        new TextRun({ text: ",", size: 22, font: "Arial" }),
      ],
      spacing: { before: 360, after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `on ${line(20)}.`, size: 22, font: "Arial" }),
      ],
      spacing: { after: 360 },
    }),
    new Paragraph({
      children: [new TextRun({ text: underline(40), size: 22, font: "Arial" })],
      spacing: { after: 60 },
      alignment: AlignmentType.LEFT,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "A Commissioner for taking Affidavits", size: 20, font: "Arial" }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "for British Columbia", size: 20, font: "Arial" })],
      spacing: { after: 360 },
    }),
    new Paragraph({
      children: [new TextRun({ text: underline(40), size: 22, font: "Arial" })],
      spacing: { after: 60 },
      alignment: AlignmentType.RIGHT,
    }),
    new Paragraph({
      children: [new TextRun({ text: deponentName, size: 22, font: "Arial" })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Signature of person swearing affidavit", size: 20, font: "Arial" })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 120 },
    }),
  ];
}

// No-border cell configuration
const noBorders: ITableCellBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

// Create a simple table with borders
export function simpleTable(
  headers: string[],
  rows: string[][],
  columnWidths?: number[]
): Table {
  const headerRow = new TableRow({
    children: headers.map((h, i) =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, font: "Arial" })] })],
        width: columnWidths ? { size: columnWidths[i], type: WidthType.PERCENTAGE } : undefined,
        shading: { type: ShadingType.SOLID, color: "E8E8E8" },
      })
    ),
  });

  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map((cell, i) =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, font: "Arial" })] })],
            width: columnWidths ? { size: columnWidths[i], type: WidthType.PERCENTAGE } : undefined,
          })
        ),
      })
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// Format currency in CAD
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Get full name from parts
export function fullName(first: string, middle?: string, last?: string): string {
  return [first, middle, last].filter(Boolean).join(" ");
}

// Get grant type display text
export function grantTypeText(grantType: string): string {
  switch (grantType) {
    case "probate":
      return "a grant of probate";
    case "admin_with_will":
      return "a grant of administration with will annexed";
    case "admin_without_will":
      return "a grant of administration without will annexed";
    case "ancillary_probate":
      return "an ancillary grant of probate";
    case "ancillary_admin_with_will":
      return "an ancillary grant of administration with will annexed";
    case "ancillary_admin_without_will":
      return "an ancillary grant of administration without will annexed";
    default:
      return "a grant of probate";
  }
}

// Check if grant type involves a will
export function hasWill(grantType: string): boolean {
  return ["probate", "admin_with_will", "ancillary_probate", "ancillary_admin_with_will"].includes(grantType);
}

// Check if grant type is ancillary
export function isAncillary(grantType: string): boolean {
  return grantType.startsWith("ancillary_");
}

// Fallback applicant for incomplete intakes — generates blanks instead of crashing
export const EMPTY_APPLICANT = {
  firstName: "",
  middleName: "",
  lastName: "",
  address: { streetNumber: "", streetName: "", poBox: "", city: "", province: "", country: "", postalCode: "" },
  isIndividual: true as const,
  namedInWill: false,
  relationship: "",
};

// Empty paragraph for spacing
export function spacer(points: number = 200): Paragraph {
  return new Paragraph({ children: [], spacing: { after: points } });
}
