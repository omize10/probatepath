import type { WillSearchRequest } from "@prisma/client";
import { PDFForm, StandardFonts } from "pdf-lib";
import { loadTemplate } from "@/lib/pdf/loadTemplate";
import { setCheckBox, setTextField } from "@/lib/pdf/fields";
import { buildVsa532NameAndAliases, splitName } from "@/lib/name";
import type { IntakeDraft } from "@/lib/intake/types";
import { buildP1ApplicationData, type MatterForP1, type PostalAddress } from "@/lib/probate/p1";

export type FormId = "will-search" | "p1" | "p3" | "p4" | "p10" | "p11" | "p17" | "p20";

const FORM_TEMPLATES: Record<FormId, string> = {
  "will-search": "vsa532_fill.pdf",
  p1: "p1_flatten_workingText.pdf",
  p3: "p3_flatten.pdf",
  p4: "p4_flatten.pdf",
  p10: "p10_flatten.pdf",
  p11: "p11_flatten.pdf",
  p17: "p17_flatten.pdf",
  p20: "p20_flatten.pdf",
};

type RenderFormOptions = {
  willSearch?: WillSearchRequest;
  intakeDraft?: IntakeDraft;
  matter?: MatterForP1;
};

export async function renderForm(formId: FormId, options: RenderFormOptions = {}) {
  if (formId === "p1") {
    if (!options.matter) {
      throw new Error("Matter data required for P1 form");
    }
    return renderP1Form(options.matter, options.intakeDraft);
  }

  const template = FORM_TEMPLATES[formId];
  const doc = await loadTemplate(template);
  if (formId === "will-search") {
    const willSearch = options?.willSearch;
    if (!willSearch) {
      throw new Error("Missing will search data");
    }
    const form = doc.getForm();
    fillWillSearch(form, willSearch, options?.intakeDraft);
    try {
      form.flatten();
    } catch {
      // ignore
    }
  }
  return doc.save();
}

function formatDate(value?: string | Date | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function fillWillSearch(form: PDFForm, data: WillSearchRequest, intake?: IntakeDraft) {
  const executorFull = data.executorFullName || intake?.executor.fullName || "";
  const executorParts = splitName(executorFull);
  const executorPhone = data.executorPhone ?? intake?.executor.phone ?? "";
  const executorCity = data.executorCity ?? intake?.executor.city ?? "";
  const executorProvince = intake?.executor.province ?? "";
  const executorPostal = intake?.executor.postalCode ?? "";
  const executorAddressLine1 = intake?.executor.addressLine1 ?? "";
  const executorAddressLine2 = intake?.executor.addressLine2 ?? "";
  const courierAddress = data.courierAddress?.trim() ?? "";
  const mailingAddress = [executorAddressLine1, executorAddressLine2].filter(Boolean).join(", ") || courierAddress;
  const cityProvince = [executorCity, executorProvince].filter(Boolean).join(", ") || executorCity || executorProvince || courierAddress;

  const deceasedName = data.deceasedFullName ?? intake?.deceased.fullName ?? "";
  const deceasedParts = splitName(deceasedName);
  const deceasedDate = formatDate(data.deceasedDateOfDeath ?? intake?.deceased.dateOfDeath);
  const deceasedBirthDate = formatDate(data.deceasedDateOfBirth ?? intake?.deceased.birthDate);
  const deceasedBirthPlace = data.deceasedPlaceOfBirth ?? intake?.deceased.placeOfBirth ?? "";

  const canonicalNames = buildVsa532NameAndAliases({
    fullName: deceasedName,
    marriedSurname: data.deceasedMarriedSurname ?? undefined,
    extraAliases: data.deceasedAliases ?? [],
  });

  const aliasFields = ["aka1", "aka2", "aka3", "aka4", "aka5", "aka6", "aka7", "aka8"];
  aliasFields.forEach((field, index) => {
    setTextField(form, field, canonicalNames.aliases[index] ?? "");
  });

  setTextField(form, "Surname", executorParts.surname ?? "");
  setTextField(form, "givenname", executorParts.givenNames ?? "");
  setTextField(form, "Address", mailingAddress || executorFull);
  setTextField(form, "City/Prov", cityProvince);
  setTextField(form, "PC", executorPostal);
  setTextField(form, "Company Name", intake?.executor.employer ?? "");
  setTextField(form, "Instructions", data.searchNotes ?? "");
  setTextField(form, "FullName", canonicalNames.fullName);
  setTextField(form, "PBirth", deceasedBirthPlace);
  setTextField(form, "Death Date", deceasedDate);
  setTextField(form, "BDate", deceasedBirthDate);
  setTextField(form, "place_death", data.deceasedCity ?? intake?.deceased.cityProvince ?? "");
  setTextField(form, "rel_to_will_search", data.executorRelationship ?? intake?.executor.relationToDeceased ?? "");
  setTextField(form, "work_no", executorPhone);
  setTextField(form, "home_no", executorPhone);

  const hasWill = data.hasWill ?? (intake?.deceased.hadWill === "yes" ? true : intake?.deceased.hadWill === "no" ? false : null);
  if (hasWill !== null) {
    setCheckBox(form, "living_will", true, { onValue: hasWill ? "yes" : "no" });
  }
  setCheckBox(form, "Living", true, { onValue: "Believe died" });
}

async function renderP1Form(matter: MatterForP1, intakeDraft?: IntakeDraft) {
  const data = buildP1ApplicationData({ matter, intakeDraft });
  const doc = await loadTemplate("p1_flatten_workingText.pdf");
  const form = doc.getForm();

  const fields = buildP1PdfFields(data);
  for (const [fieldName, value] of Object.entries(fields)) {
    try {
      const textField = form.getTextField(fieldName);
      textField.setText(value ?? "");
    } catch {
      // Ignore missing fields to keep rendering resilient.
    }
  }

  try {
    form.flatten();
  } catch {
    // Ignore flatten errors for resilience.
  }

  return doc.save();
}

function buildP1PdfFields(data: ReturnType<typeof buildP1ApplicationData>) {
  const applicant = data.applicants[0];
  const applicantAddressLines = formatStreetLines(applicant?.address);
  const applicantCityLine = formatCityProvincePostal(applicant?.address);
  const serviceAddress = data.serviceAddress ?? applicant?.address;
  const serviceAddressLines = formatStreetLines(serviceAddress);
  const serviceCityLine = formatCityProvincePostal(serviceAddress);
  const serviceSameAsMailing = addressesMatch(serviceAddress, applicant?.address);

  return {
    Text1: applicant?.fullName ?? "",
    Text2: applicantAddressLines,
    Text3: applicantCityLine,
    Text4: applicant?.email ?? "",
    Text5: applicant?.phone ?? "",
    Text6: data.signatureLines > 0 ? String(data.signatureLines) : "",
    Text7: serviceSameAsMailing ? "X" : "",
    Text8: serviceAddressLines,
    Text9: serviceCityLine,
    Text10: data.serviceEmail ?? applicant?.email ?? "",
    Text11: data.servicePhone ?? applicant?.phone ?? "",
    Text12: data.registryLocation ?? "",
    Text13: data.registryName ?? "",
    Text14: data.grantOption ?? "",
    Text15: data.deceased.firstNames ?? "",
    Text16: data.deceased.middleNames ?? "",
    Text17: data.deceased.surname ?? "",
    Text18: joinLines(data.deceased.addressLines),
    Text19: formatDate(data.deceased.dateOfDeath),
    Text20: data.relatesToPhysicalWill ? "X" : "",
    Text21: formatDate(data.physicalWillDate),
    Text22: data.relatesToElectronicWill ? "X" : "",
    Text23: formatDate(data.electronicWillDate),
  };
}

function joinLines(lines?: string[]) {
  if (!lines || lines.length === 0) return "";
  return lines.filter(Boolean).join("\n");
}

function formatStreetLines(address?: PostalAddress | null) {
  if (!address) return "";
  return [address.line1, address.line2, address.country].filter((line) => line?.trim()).map((line) => line!.trim()).join("\n");
}

function formatCityProvincePostal(address?: PostalAddress | null) {
  if (!address) return "";
  const parts = [address.city, address.province, address.postalCode].filter((part) => part?.trim()).map((part) => part!.trim());
  return parts.join(", ");
}

function addressesMatch(a?: PostalAddress | null, b?: PostalAddress | null) {
  if (!a || !b) return false;
  const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? "";
  return (
    normalize(a.line1) === normalize(b.line1) &&
    normalize(a.line2) === normalize(b.line2) &&
    normalize(a.city) === normalize(b.city) &&
    normalize(a.province) === normalize(b.province) &&
    normalize(a.postalCode) === normalize(b.postalCode) &&
    normalize(a.country) === normalize(b.country)
  );
}
