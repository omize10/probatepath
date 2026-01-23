import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
} from "docx";
import type { EstateData } from "./types";
import {
  p,
  boldP,
  centered,
  checkbox,
  checkboxP,
  fieldRow,
  formatAddress,
  formatCurrency,
  fullName,
  grantTypeText,
  juratBlock,
  line,
  sectionHeader,
  spacer,
} from "./docx-utils";

export async function generateP10(data: EstateData): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  const primaryApplicant = data.applicants[0];
  const applicantName = fullName(
    primaryApplicant.firstName,
    primaryApplicant.middleName,
    primaryApplicant.lastName
  );
  const deceasedName = fullName(
    data.deceased.firstName,
    data.deceased.middleName,
    data.deceased.lastName
  );

  // Form header
  children.push(centered("Form P10 (Rule 25-3 (2))", { bold: true, size: 24 }));
  children.push(spacer(80));
  children.push(
    centered(
      "AFFIDAVIT OF ASSETS AND LIABILITIES FOR DOMICILED ESTATE GRANT",
      { bold: true, size: 22 }
    )
  );
  children.push(spacer(60));

  // Affidavit numbering line
  children.push(
    p([
      new TextRun({ text: "This is the 1st affidavit of ", size: 22, font: "Arial" }),
      new TextRun({ text: applicantName, size: 22, font: "Arial", bold: true }),
      new TextRun({ text: " in this case and was made on ", size: 22, font: "Arial" }),
      new TextRun({ text: line(15), size: 22, font: "Arial" }),
    ])
  );
  children.push(spacer(60));

  // Registry info
  children.push(fieldRow("No.", data.fileNumber || ""));
  children.push(centered("In the Supreme Court of British Columbia", { size: 22 }));
  children.push(spacer(60));
  children.push(
    p([
      new TextRun({ text: "In the matter of the estate of ", size: 22, font: "Arial" }),
      new TextRun({ text: deceasedName, size: 22, font: "Arial", bold: true }),
      new TextRun({ text: ", deceased", size: 22, font: "Arial" }),
    ])
  );
  children.push(spacer(120));

  // Deponent intro
  const applicantAddress = formatAddress(primaryApplicant.address);
  children.push(
    p([
      new TextRun({ text: "I, ", size: 22, font: "Arial" }),
      new TextRun({ text: applicantName, size: 22, font: "Arial", bold: true }),
      new TextRun({ text: ", of ", size: 22, font: "Arial" }),
      new TextRun({ text: applicantAddress, size: 22, font: "Arial" }),
      new TextRun({ text: ", SWEAR (OR AFFIRM) THAT:", size: 22, font: "Arial" }),
    ])
  );
  children.push(spacer(200));

  // Paragraph 1: Applicant role
  children.push(
    p([
      new TextRun({ text: "1. ", size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: `I am the applicant for ${grantTypeText(data.grantType)} in relation to the estate of `,
        size: 22,
        font: "Arial",
      }),
      new TextRun({ text: deceasedName, size: 22, font: "Arial", bold: true }),
      new TextRun({ text: ".", size: 22, font: "Arial" }),
    ])
  );
  children.push(spacer(120));

  // Paragraph 2: Diligent search
  children.push(
    p([
      new TextRun({ text: "2. ", size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: "I have made diligent search and inquiry to find the property and liabilities of the deceased.",
        size: 22,
        font: "Arial",
      }),
    ])
  );
  children.push(spacer(120));

  // Paragraph 3: Exhibit A reference
  children.push(
    p([
      new TextRun({ text: "3. ", size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: "Exhibit A to this affidavit discloses, to the best of my knowledge and belief,",
        size: 22,
        font: "Arial",
      }),
    ])
  );
  children.push(
    p("(a) the real property and tangible personal property within British Columbia and the intangible personal property, wherever situated, that passes to me as personal representative of the deceased,", { indent: { left: 720 } })
  );
  children.push(
    p("(b) the value of that property on the date of death, and", { indent: { left: 720 } })
  );
  children.push(
    p("(c) the liabilities that encumber that property.", { indent: { left: 720 } })
  );
  children.push(spacer(120));

  // Paragraph 4: Exhibit B (outside BC property)
  const hasOutsideBCProperty =
    (data.assets?.realPropertyOutsideBC?.length || 0) > 0 ||
    (data.assets?.tangiblePersonalPropertyOutsideBC?.length || 0) > 0;

  children.push(
    p([
      new TextRun({ text: "4. ", size: 22, font: "Arial", bold: true }),
      new TextRun({ text: checkbox(hasOutsideBCProperty), size: 22, font: "Arial" }),
      new TextRun({
        text: " Exhibit B to this affidavit discloses, to the best of my knowledge and belief, the real property and tangible personal property outside British Columbia that passes to me as personal representative of the deceased and the value of that property on the date of death.",
        size: 22,
        font: "Arial",
      }),
    ])
  );
  children.push(
    p([
      new TextRun({ text: "   ", size: 22, font: "Arial" }),
      new TextRun({ text: checkbox(!hasOutsideBCProperty), size: 22, font: "Arial" }),
      new TextRun({
        text: " To the best of my knowledge and belief, there is no real property or tangible personal property outside British Columbia that passes to me as personal representative of the deceased.",
        size: 22,
        font: "Arial",
      }),
    ], { indent: { left: 360 } })
  );
  children.push(spacer(120));

  // Paragraph 5: Supplemental filing commitment
  children.push(
    p([
      new TextRun({ text: "5. ", size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: "If I discover that there is an omission or inaccuracy in Exhibit A or Exhibit B, I will file a supplemental affidavit of assets and liabilities in Form P14.",
        size: 22,
        font: "Arial",
      }),
    ])
  );
  children.push(spacer(240));

  // Jurat
  children.push(...juratBlock(applicantName, data.registry));

  // ===== EXHIBIT A =====
  children.push(spacer(360));
  children.push(centered("EXHIBIT A", { bold: true, size: 24 }));
  children.push(spacer(60));
  children.push(
    centered("STATEMENT OF ASSETS, LIABILITIES AND DISTRIBUTION", { bold: true, size: 22 })
  );
  children.push(spacer(200));

  const assets = data.assets || {
    realPropertyBC: [],
    tangiblePersonalPropertyBC: [],
    intangibleProperty: [],
  };

  // Part 1: Real Property within BC
  children.push(sectionHeader("PART 1 -- REAL PROPERTY WITHIN BRITISH COLUMBIA"));
  children.push(spacer(60));

  if (assets.realPropertyBC.length === 0) {
    children.push(p("None."));
  } else {
    children.push(buildAssetTable(
      assets.realPropertyBC.map((a) => ({
        description: a.description + (a.owners ? ` (Owners: ${a.owners})` : ""),
        value: a.marketValue,
        securedDebt: a.securedDebt,
      }))
    ));
  }

  const totalReal = assets.realPropertyBC.reduce((sum, a) => sum + a.marketValue, 0);
  const totalRealDebt = assets.realPropertyBC.reduce(
    (sum, a) => sum + (a.securedDebt?.amount || 0),
    0
  );
  children.push(spacer(60));
  children.push(boldP(`Subtotal Real Property: ${formatCurrency(totalReal)}`));
  if (totalRealDebt > 0) {
    children.push(p(`Less secured debts: ${formatCurrency(totalRealDebt)}`));
  }
  children.push(spacer(200));

  // Part 2: Tangible Personal Property within BC
  children.push(sectionHeader("PART 2 -- TANGIBLE PERSONAL PROPERTY WITHIN BRITISH COLUMBIA"));
  children.push(spacer(60));

  if (assets.tangiblePersonalPropertyBC.length === 0) {
    children.push(p("None."));
  } else {
    children.push(buildAssetTable(
      assets.tangiblePersonalPropertyBC.map((a) => ({
        description: a.description,
        value: a.value,
        securedDebt: a.securedDebt,
      }))
    ));
  }

  const totalTangible = assets.tangiblePersonalPropertyBC.reduce((sum, a) => sum + a.value, 0);
  const totalTangibleDebt = assets.tangiblePersonalPropertyBC.reduce(
    (sum, a) => sum + (a.securedDebt?.amount || 0),
    0
  );
  children.push(spacer(60));
  children.push(boldP(`Subtotal Tangible Personal Property: ${formatCurrency(totalTangible)}`));
  if (totalTangibleDebt > 0) {
    children.push(p(`Less secured debts: ${formatCurrency(totalTangibleDebt)}`));
  }
  children.push(spacer(200));

  // Part 3: Intangible Personal Property
  children.push(
    sectionHeader("PART 3 -- INTANGIBLE PERSONAL PROPERTY (WHEREVER SITUATED)")
  );
  children.push(spacer(60));

  if (assets.intangibleProperty.length === 0) {
    children.push(p("None."));
  } else {
    children.push(
      buildSimpleAssetTable(
        assets.intangibleProperty.map((a) => ({
          description: a.description,
          value: a.value,
        }))
      )
    );
  }

  const totalIntangible = assets.intangibleProperty.reduce((sum, a) => sum + a.value, 0);
  children.push(spacer(60));
  children.push(boldP(`Subtotal Intangible Personal Property: ${formatCurrency(totalIntangible)}`));
  children.push(spacer(200));

  // Totals
  const grossAssets = totalReal + totalTangible + totalIntangible;
  const totalDebts = totalRealDebt + totalTangibleDebt;
  const netAssets = grossAssets - totalDebts;

  children.push(sectionHeader("SUMMARY"));
  children.push(spacer(60));
  children.push(boldP(`Gross value of assets in Exhibit A: ${formatCurrency(grossAssets)}`));
  children.push(boldP(`Total secured debts: ${formatCurrency(totalDebts)}`));
  children.push(boldP(`Net value of estate: ${formatCurrency(netAssets)}`));

  // ===== EXHIBIT B (if applicable) =====
  if (hasOutsideBCProperty) {
    children.push(spacer(360));
    children.push(centered("EXHIBIT B", { bold: true, size: 24 }));
    children.push(spacer(60));
    children.push(
      centered("STATEMENT OF REAL AND TANGIBLE PROPERTY OUTSIDE OF BRITISH COLUMBIA", {
        bold: true,
        size: 22,
      })
    );
    children.push(spacer(200));

    // Real property outside BC
    if (assets.realPropertyOutsideBC && assets.realPropertyOutsideBC.length > 0) {
      children.push(sectionHeader("PART 1 -- REAL PROPERTY OUTSIDE BRITISH COLUMBIA"));
      children.push(spacer(60));
      children.push(
        buildSimpleAssetTable(
          assets.realPropertyOutsideBC.map((a) => ({
            description: a.description,
            value: a.value,
          }))
        )
      );
      const totalRealOutside = assets.realPropertyOutsideBC.reduce((sum, a) => sum + a.value, 0);
      children.push(spacer(60));
      children.push(boldP(`Subtotal: ${formatCurrency(totalRealOutside)}`));
      children.push(spacer(200));
    }

    // Tangible personal property outside BC
    if (assets.tangiblePersonalPropertyOutsideBC && assets.tangiblePersonalPropertyOutsideBC.length > 0) {
      children.push(
        sectionHeader("PART 2 -- TANGIBLE PERSONAL PROPERTY OUTSIDE BRITISH COLUMBIA")
      );
      children.push(spacer(60));
      children.push(
        buildSimpleAssetTable(
          assets.tangiblePersonalPropertyOutsideBC.map((a) => ({
            description: a.description,
            value: a.value,
          }))
        )
      );
      const totalTangibleOutside = assets.tangiblePersonalPropertyOutsideBC.reduce(
        (sum, a) => sum + a.value,
        0
      );
      children.push(spacer(60));
      children.push(boldP(`Subtotal: ${formatCurrency(totalTangibleOutside)}`));
    }
  }

  // Build document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 1080, right: 1080 },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

// Build table with description, value, and secured debt columns
function buildAssetTable(
  items: Array<{ description: string; value: number; securedDebt?: { creditor: string; amount: number } }>
): Table {
  const headerRow = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true, size: 20, font: "Arial" })] })],
        width: { size: 50, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: "E8E8E8" },
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Value at Date of Death", bold: true, size: 20, font: "Arial" })] })],
        width: { size: 25, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: "E8E8E8" },
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Secured Debt", bold: true, size: 20, font: "Arial" })] })],
        width: { size: 25, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: "E8E8E8" },
      }),
    ],
  });

  const dataRows = items.map(
    (item) =>
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: item.description, size: 20, font: "Arial" })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(item.value), size: 20, font: "Arial" })] })],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: item.securedDebt
                      ? `${item.securedDebt.creditor}: ${formatCurrency(item.securedDebt.amount)}`
                      : "None",
                    size: 20,
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
        ],
      })
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// Build simple table with description and value only
function buildSimpleAssetTable(
  items: Array<{ description: string; value: number }>
): Table {
  const headerRow = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true, size: 20, font: "Arial" })] })],
        width: { size: 65, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: "E8E8E8" },
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Value at Date of Death", bold: true, size: 20, font: "Arial" })] })],
        width: { size: 35, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: "E8E8E8" },
      }),
    ],
  });

  const dataRows = items.map(
    (item) =>
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: item.description, size: 20, font: "Arial" })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(item.value), size: 20, font: "Arial" })] })],
          }),
        ],
      })
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}
